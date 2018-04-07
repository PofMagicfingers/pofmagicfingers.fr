import React from "react";

import Link from "gatsby-link";

import Cover from "./Cover";

const PostHeader = ({ post }) => (
  <header className="post-header">
    <Link to={post.path}>
      <Cover post={post} />
      <h3 className="title">{post.title}</h3>
    </Link>
  </header>
);

export default PostHeader;
