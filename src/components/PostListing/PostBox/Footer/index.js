import React from "react";

import TimeToRead from "./TimeToRead";
import Category from "./Category";
import PublishedAt from "./PublishedAt";

const PostFooter = ({ post }) => (
  <footer className="post-footer">
    <TimeToRead post={post} />
    <Category post={post} />
    <PublishedAt post={post} />
  </footer>
);

export default PostFooter;
