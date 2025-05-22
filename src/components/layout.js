import React from 'react';
import { css } from '@emotion/core';
import { useStaticQuery, Link, graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import { FaGithub, FaTwitter, FaStackOverflow, FaLinkedin } from 'react-icons/fa';

import { rhythm } from '../utils/typography';

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
    <div css={css``}>
      <Helmet>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta property="og:logo" content="/android-chrome-512x512.png"></meta>
        <link rel="manifest" href="/site.webmanifest" />
        <title>{data.site.siteMetadata.title}</title>
      </Helmet>
      <div
        css={css`
          height: 70px;
          background-color: #fbfaf3;
          padding-right: clamp(30px, 5vw, 50px);
          padding-left: clamp(30px, 5vw, 50px);
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <Link
          to={`/`}
          css={css`
            color: rgb(17, 17, 17);
            text-decoration: none;
            font-size: 22px;
            font-weight: 700;
            display: inline-block;
            font-style: normal;
          `}
        >
          Andrew Stevens | Dev Site
        </Link>
        <Link to={`/about/`}>About</Link>
      </div>
      <div
        css={css`
          margin: 0 auto;
          max-width: 700px;
          padding: ${rhythm(2)};
          padding-top: ${rhythm(1.5)};
        `}
      >
        {children}
      </div>
      <div
        css={css`
          background-color: #fbfaf3;
          padding-top: 50px;
          padding-bottom: 120px;
          padding-right: clamp(30px, 5vw, 50px);
          padding-left: clamp(30px, 5vw, 50px);
          display: flex;
          justify-content: space-between;
          align-items: start;
        `}
      >
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
        <div
          css={css`
            line-height: 30px;
          `}
        >
          <div
            css={css`
              color: rgb(17, 17, 17);
              font-size: 18px;
              font-weight: 700;
            `}
          >
            Websites
          </div>
          <div>
            <a
              css={css`
                color: rgb(17, 17, 17);
                font-size: 18px;
                font-weight: 300;
              `}
              href="https://andrewstevens.me"
            >
              andrewstevens.me
            </a>
          </div>
          <div>
            <a href="https://andrewstevens.dev">andrewstevens.dev</a>
          </div>
          <div>
            <a href="https://andrewstevens.photos">andrewstevens.photos</a>
          </div>
        </div>
      </div>
    </div>
  );
};
