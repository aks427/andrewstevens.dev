import React, { useLayoutEffect } from "react";
import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import "../styles/books.scss";

export default () => {
  const numberOfBooks = 18;
  const widgetReadId = "read";

  useLayoutEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://www.goodreads.com/review/grid_widget/9868029?cover_size=medium&hide_link=true&hide_title=true&num_books=${numberOfBooks}&order=d&shelf=read&sort=date_read&widget_id=${widgetReadId}`;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  });

  return (
    <Layout>
      <Helmet>
        <title>Books</title>
      </Helmet>
      <div className="books">
        <h2>Recently Read</h2>
        <div id={`gr_grid_widget_${widgetReadId}`} />
      </div>
    </Layout>
  );
};
