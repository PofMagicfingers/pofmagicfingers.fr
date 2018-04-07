import React from "react";

import PostHeader from "./Header";
import PostFooter from "./Footer";

const PostBox = ({ post }) => {
  return (
    <article className="post-box">
      <PostHeader post={post} />
      <PostFooter post={post} />
    </article>
  );
};

export default PostBox;
