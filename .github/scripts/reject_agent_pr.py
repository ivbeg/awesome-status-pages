#!/usr/bin/env python3
"""Close a pull request that carries a coding-agent signature.

Reads REPO, PR_NUMBER, and GH_TOKEN. Checks the pull request body and
commit messages. Leaves the pull request open when no signature matches.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request

PATTERNS = (
    ("Generated with", re.compile(r"Generated with", re.I)),
    ("noreply@anthropic.com", re.compile(r"noreply@anthropic\.com", re.I)),
    ("cursoragent@cursor.com", re.compile(r"cursoragent@cursor\.com", re.I)),
    ("Co-Authored-By: Claude", re.compile(r"Co-Authored-By:\s*Claude", re.I)),
    ("Co-Authored-By: Cursor", re.compile(r"Co-Authored-By:\s*Cursor", re.I)),
    ("Copilot Autofix", re.compile(r"Copilot Autofix", re.I)),
)

COMMENT = """Automated contributions are not accepted in this repository.

This pull request includes a coding-agent signature (`{signature}`) in the description or a commit message. It will not be merged.

Edit README.md in the browser on github.com if you want a human to review the entry. Agent instructions are in AGENTS.md.
"""


def find_signature(text):
    for name, pattern in PATTERNS:
        if pattern.search(text or ""):
            return name
    return None


def _request(method, url, token, payload=None):
    data = None
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "awesome-status-pages-agent-check",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")
        raise SystemExit(f"GitHub API {method} {url} failed: {error.code} {detail}") from error


def _commits(repo, number, token):
    page = 1
    while True:
        url = (
            f"https://api.github.com/repos/{repo}/pulls/{number}/commits"
            f"?per_page=100&page={page}"
        )
        batch = _request("GET", url, token)
        if not batch:
            return
        for commit in batch:
            yield commit.get("commit", {}).get("message") or ""
        if len(batch) < 100:
            return
        page += 1


def main():
    repo = os.environ["REPO"]
    number = os.environ["PR_NUMBER"]
    token = os.environ["GH_TOKEN"]
    pull = _request("GET", f"https://api.github.com/repos/{repo}/pulls/{number}", token)
    if pull.get("state") != "open":
        print(f"#{number} is already {pull.get('state')}")
        return 0
    chunks = [pull.get("body") or ""]
    chunks.extend(_commits(repo, number, token))
    signature = find_signature("\n".join(chunks))
    if signature is None:
        print(f"#{number} has no agent signature")
        return 0
    print(f"#{number} matched {signature}")
    _request(
        "POST",
        f"https://api.github.com/repos/{repo}/issues/{number}/comments",
        token,
        {"body": COMMENT.format(signature=signature)},
    )
    _request(
        "PATCH",
        f"https://api.github.com/repos/{repo}/issues/{number}",
        token,
        {"state": "closed", "state_reason": "not_planned"},
    )
    print(f"#{number} closed")
    return 0


def _self_check():
    assert find_signature("Generated with [Claude Code](https://claude.com/claude-code)")
    assert find_signature("Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>")
    assert find_signature("Co-authored-by: Cursor <cursoragent@cursor.com>")
    assert find_signature("Co-authored-by: Copilot Autofix powered by AI")
    assert find_signature("cursoragent@cursor.com")
    assert find_signature("noreply@anthropic.com")
    assert find_signature("monitors GitHub Copilot, Cursor, and Claude") is None
    assert find_signature("the company who owns Claude and Claude Code") is None
    assert find_signature("Adds Fettle to the Services section, alphabetically") is None
    assert find_signature("") is None


if __name__ == "__main__":
    if os.environ.get("SELF_CHECK") == "1":
        _self_check()
        print("ok")
        sys.exit(0)
    sys.exit(main())
