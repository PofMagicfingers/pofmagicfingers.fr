import React from "react";

import FontAwesome from "react-fontawesome";

const Category = ({ post }) =>
  post.category === "YouTube" ? (
    <h5 className="category">
      <FontAwesome name="youtube" />&nbsp;{post.source}
    </h5>
  ) : null;

export default Category;
