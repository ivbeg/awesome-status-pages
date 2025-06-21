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

  const startIndex = readmeContent.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(
      "Could not find Public Status Pages section marker in README.md"
    );
  }

  const beforeSection = readmeContent.substring(0, startIndex);

  const newPublicStatusPagesSection = `${startMarker}\n${statusPagesMarkdown}\n`;

  const newReadmeContent = beforeSection + newPublicStatusPagesSection;

  await fs.writeFile(readmePath, newReadmeContent, "utf8");

  console.log(
    `✅ Successfully updated README.md with ${statusPages.length} status pages from @sentry/status-page-list`
  );
}

generateStatusPages();
