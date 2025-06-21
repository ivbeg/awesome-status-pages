import fs from "node:fs/promises";
import path from "node:path";

async function generateStatusPages() {
  const { domainToStatusPageUrls, ...restStatusPages } = await import(
    "@sentry/status-page-list"
  );

  const statusPages = Object.values(restStatusPages).sort((value) =>
    value.name.localeCompare(value.name)
  );

  console.log(
    `Found ${statusPages.length} status pages from @sentry/status-page-list`
  );

  const statusPagesMarkdown = statusPages
    .map(
      ({ name, statusPageUrl }) =>
        `* [${name}](${statusPageUrl}) - ${name} status page`
    )
    .join("\n");

  const readmePath = path.join(__dirname, "../README.md");
  const readmeContent = await fs.readFile(readmePath, "utf8");

  const startMarker = "## Public Status Pages";
  const endMarker = "\n## Hosting and Cloud";

  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      "Could not find Public Status Pages section markers in README.md"
    );
  }

  const beforeSection = readmeContent.substring(0, startIndex);
  const afterSection = readmeContent.substring(endIndex);

  const newPublicStatusPagesSection = `${startMarker}\n${statusPagesMarkdown}\n`;

  const newReadmeContent =
    beforeSection + newPublicStatusPagesSection + afterSection;

  await fs.writeFile(readmePath, newReadmeContent, "utf8");

  console.log(
    `✅ Successfully updated README.md with ${statusPages.length} status pages from @sentry/status-page-list`
  );
}

generateStatusPages();
