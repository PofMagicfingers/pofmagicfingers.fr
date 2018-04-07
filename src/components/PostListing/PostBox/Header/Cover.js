import React from "react";

import GatsbyImage from "gatsby-image";

const Cover = ({ post }) => {
  const attrs = {
    title: post.title,
    alt: post.title,
    className: "cover"
  };

  if (post.coverResolutions) {
    return (
      <GatsbyImage
        resolutions={post.coverResolutions}
        style={{ transitionDelay: "0.75s" }}
        imgStyle={{ transitionDelay: "0.35s" }}
        {...attrs}
      />
    );
  }
  if (post.cover) {
    <img src={post.cover} {...attrs} />;
  }

  return null;
};

export default Cover;
