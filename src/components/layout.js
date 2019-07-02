import React from "react";
import { css } from "@emotion/core";
import { useStaticQuery, Link, graphql } from "gatsby";
import { Helmet } from "react-helmet";
import { FaGithub, FaTwitter, FaStackOverflow, FaLinkedin } from "react-icons/fa";

import { rhythm } from "../utils/typography";

export default ({ children }) => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );
  return (
    <div
      css={css`
        margin: 0 auto;
        max-width: 700px;
        padding: ${rhythm(2)};
        padding-top: ${rhythm(1.5)};
      `}
    >
      <Helmet>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <title>{data.site.siteMetadata.title}</title>
      </Helmet>
      <Link to={`/`}>
        <h3
          css={css`
            margin-bottom: ${rhythm(2)};
            display: inline-block;
            font-style: normal;
          `}
        >
          {data.site.siteMetadata.title}
        </h3>
      </Link>
      <Link
        to={`/about/`}
        css={css`
          float: right;
        `}
      >
        About
      </Link>
      {children}
      <div className="social-links">
        <a href="https://github.com/aks427" target="_blank" title="GitHub">
          <FaGithub />
        </a>
        <a href="https://twitter.com/aks427" target="_blank" title="Twitter">
          <FaTwitter />
        </a>
        <a href="https://stackoverflow.com/users/505108/andrew-stevens" target="_blank" title="Stack Overflow">
          <FaStackOverflow />
        </a>
        <a href="https://www.linkedin.com/in/aks427/" target="_blank" title="LinkedIn">
          <FaLinkedin />
        </a>
      </div>
    </div>
  );
};
