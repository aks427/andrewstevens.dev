import React from "react";
import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import "../styles/books.scss";

export default () => {
  const numberOfBooks = 18;
  const widgetReadId = "read";

  return (
    <Layout>
      <Helmet>
        <title>Books</title>
        <script
          type="text/javascript"
          src={`https://www.goodreads.com/review/grid_widget/9868029?cover_size=medium&hide_link=true&hide_title=true&num_books=${numberOfBooks}&order=d&shelf=read&sort=date_read&widget_id=${widgetReadId}`}
        />
      </Helmet>
      <div className="books">
        <h2>Recently Read</h2>
        <div id={`gr_grid_widget_${widgetReadId}`} />
      </div>
    </Layout>
  );
};
