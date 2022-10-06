import Head from "next/head";
import Markdown from "../components/Markdown";
import { readFileSync } from "fs";
import path from "path";

export default function Home({ content }) {
  return (
    <div className="container mx-auto px-4 md:px-32 lg:px-44 xl:px-64 pb-8">
      <Head>
        <title>Awesome Status Pages</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Awesome list of status pages open source software, online services and public status pages of major internet companies" />
        <meta property="og:url" content="https://awesome-statuspages.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Awesome Status Pages" />
        <meta name="twitter:card" content="summary" />
        <meta
          property="og:description"
          content="Awesome list of status pages open source software, online services and public status pages of major internet companies"
        />
        <meta property="og:image" content="https://awesome-statuspages.com/social.png" />
      </Head>

      <main>
        <Markdown content={content} />
      </main>

      <hr className="my-14" />

      <footer>
        <div className="text-sm flex flex-col lg:flex-row text-center justify-center items-center mt-5 mb-10 space-x-4 space-y-4 lg:space-y-0">
          <a
            href="https://cronitor.io"
            target="_blank"
            rel="noopener"
            className="hover:no-underline w-full flex flex-row justify-center items-center space-x-1.5"
          >
            <span>Website made with ❤️ by </span>{" "}
            <img
              alt="Cronitor"
              src="/cronitor-logo.svg"
              className="w-auto h-3.5"
              width="100%"
              height={3.5}
            />
          </a>
          <a
            href="https://github.com/ivbeg/awesome-status-pages"
            target="_blank"
            rel="noopener"
            className="hover:no-underline w-full flex flex-row justify-center items-center space-x-1.5"
          >
            <span>Based on:</span>{" "}
            <span className="font-bold text-gray-100">
              ivbeg/awesome-status-pages
            </span>{" "}
            <img
              alt="GitHub"
              src="/github-logo.svg"
              className="w-auto h-4 invert"
              width="100%"
              height={4}
            />
          </a>
        </div>
      </footer>
    </div>
  );
}

// Build-time props
export function getStaticProps({ params }) {
  const content = readFileSync(
    path.join(process.cwd(), `../README.md`),
    "utf8"
  );
  return { props: { content } };
}
