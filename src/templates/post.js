import React from "react";
import { graphql } from "gatsby";
import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import "../styles/post.scss";

export default ({ data }) => {
  const post = data.markdownRemark;
  console.log(data);
  return (
    <Layout>
      <Helmet>
        <title>{post.frontmatter.title} | Andrew Stevens</title>
      </Helmet>
      <div className="post">
        <h2>{post.frontmatter.title}</h2>
        <div className="posted-date">{post.frontmatter.date}</div>
        <div className="time-to-read">{post.timeToRead} minute read</div>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </Layout>
  );
};

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "DD MMMM, YYYY")
      }
    }
  }
`;
