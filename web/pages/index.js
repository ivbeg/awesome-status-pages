import Head from "next/head";
import Markdown from "../components/Markdown";
import {readFileSync} from "fs";
import path from "path";

export default function Home({ content }) {
  return (
    <div className="container mx-auto px-4 md:px-32 lg:px-44 xl:px-64 pb-8">
      <Head>
        <title>Awesome Status Pages</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Markdown content={content} />
      </main>

      <hr className=" my-14" />

      <footer>
        <div className="text-sm flex flex-row text-center justify-center items-center mt-5 mb-10 space-x-4">
          <a
            href="https://github.com/ivbeg/awesome-status-pages"
            target="_blank"
            rel="noopener"
            className="hover:no-underline w-full flex flex-row justify-center items-center space-x-1.5"
          >
            <span>ivbeg/awesome-status-pages</span>{" "}
            <img
              alt="GitHub"
              src="/github-logo.svg"
              className="w-auto h-4 invert"
              width="100%"
              height={3.5}
            />
          </a>
          <a
            href="https://cronitor.io"
            target="_blank"
            rel="noopener"
            className="hover:no-underline w-full flex flex-row justify-center items-center space-x-1.5"
          >
            <span>Sponsored by </span>{" "}
            <img
              alt="Cronitor"
              src="/cronitor-logo.svg"
              className="w-auto h-3.5"
              width="100%"
              height={3.5}
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
