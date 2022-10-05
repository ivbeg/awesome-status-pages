import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";

import Slugger from "github-slugger";

const slugs = Slugger();

const Headings = ({ level, children }) => {
  // Access actual (string) value of heading
  const heading = children[0];

  // Extract text from element (could be an `a` or a `h1,h2,h3...`)
  const text = heading?.props?.children[0] ?? heading;

  // If we have a heading, make it lower case
  let anchor = typeof text === "string" ? text.toLowerCase() : "";

  // Clean anchor (replace special characters whitespaces).
  // Alternatively, use encodeURIComponent() if you don't care about
  // pretty anchor links
  slugs.reset();
  anchor = slugs.slug(anchor);

  // Utility
  const container = (children) => <span id={anchor}>{children}</span>;

  switch (level) {
    case 1:
      return <h1 id={anchor}>{children}</h1>;
    case 2:
      return <h2 id={anchor}>{children}</h2>;
    case 3:
      return <h3 id={anchor}>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    default:
      return <h6>{children}</h6>;
  }
};

export default function Markdown({ content }) {
  return (
    <ReactMarkdown
      className="markdown"
      children={content}
      components={{
        h1: Headings,
        h2: Headings,
        h3: Headings,
        h4: Headings,
        h5: Headings,
        h6: Headings,
        img: (props) => (
          <span className="markdown-image-wrapper">
            <img
              src={props.src}
              alt={props.alt}
              width="100%"
              height="auto"
              loading="lazy"
            />
          </span>
        ),
        a: (props) => (
          <a href={props.href} rel="noopener">
            {props.children}
          </a>
        ),
      }}
      remarkPlugins={[gfm, remarkUnwrapImages]}
    />
  );
}
