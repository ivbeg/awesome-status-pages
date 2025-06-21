import fs from "node:fs/promises";
import path from "node:path";
import ky, { HTTPError, TimeoutError } from "ky";

const USER_AGENT = "Mozilla/5.0 (compatible; LinkAuditor/1.0)";
const BATCH_SIZE = 20;
const README_FILE_NAME = "README.md";

type UrlResult = { url: string; status: number; error?: string };

const checkUrl = async (url: string): Promise<UrlResult> => {
  try {
    const response = await ky.get(url, {
      headers: { "User-Agent": USER_AGENT },
      throwHttpErrors: false,
      redirect: "follow",
    });

    return {
      url,
      status: response.status,
    };
  } catch (err) {
    if (err instanceof HTTPError) {
      return {
        url,
        status: err.response.status,
        error: err.message,
      };
    }

    if (err instanceof TimeoutError) {
      return {
        url,
        status: 0,
        error: err.message,
      };
    }

    if (err instanceof Error) {
      return { url, status: 0, error: err.message };
    }

    return { url, status: 0, error: "Failed to fetch" };
  }
};

const extractUrlsFromMarkdown = (content: string): string[] => {
  const markdownLinkRegex = /\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;

  const urls = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = markdownLinkRegex.exec(content)) !== null) {
    urls.add(match[1]);
  }

  return Array.from(urls);
};

const auditLinks = async () => {
  try {
    const readmePath = path.join(import.meta.dirname, "..", README_FILE_NAME);
    const readmeContent = await fs.readFile(readmePath, "utf8");

    const urls = extractUrlsFromMarkdown(readmeContent);
    console.log(`Found ${urls.length} unique URLs to check...\n`);

    if (urls.length === 0) {
      console.log("No links found in the Markdown file. Exiting.");
      process.exit(0);
    }

    const allResults: UrlResult[] = [];

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(checkUrl));
      allResults.push(...batchResults);

      console.log(
        `Checked ${Math.min(i + BATCH_SIZE, urls.length)}/${urls.length} URLs`
      );
    }

    const failedLinks = allResults.filter((result) => result.status !== 200);
    const successfulLinks = allResults.filter(
      (result) => result.status === 200
    );

    console.log("\n--- AUDIT RESULTS ---");
    console.log(`✅ Successful: ${successfulLinks.length}`);
    console.log(`❌ Failed: ${failedLinks.length}`);

    if (failedLinks.length > 0) {
      console.log("\n--- FAILED LINKS ---");
      failedLinks.forEach((link) => {
        console.log(`❌ ${link.url}`);
        console.log(`   Status: ${link.status}`);
        console.log(`   Error: ${link.error}`);
      });
    }

    if (failedLinks.length === 0) {
      console.log("\n🎉 All links are working correctly!");
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${failedLinks.length} links need attention.`);
      process.exit(1);
    }
  } catch (error) {
    console.error("An error occurred during the audit process:");
    console.error(error);
    process.exit(1);
  }
};

auditLinks();
