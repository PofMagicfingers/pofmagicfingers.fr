import React from "react";
import PostBox from "./PostBox";

import "./PostListing.scss";

class PostListing extends React.Component {
  getPostList() {
    return this.props.postEdges.map(postEdge => {
      const node = postEdge.node || {};
      const frontmatter = node.frontmatter || {};

      const coverResolutions =
        node.parent &&
        node.parent.thumbnailFile &&
        node.parent.thumbnailFile.childImageSharp.resolutions;

      return {
        id: node.id,
        path: node.fields.slug,
        tags: frontmatter.tags,
        coverResolutions,
        cover: frontmatter.cover,
        title: frontmatter.title,
        date: frontmatter.date,
        customTimeToRead: frontmatter.timeToRead,
        excerpt: node.excerpt,
        timeToRead: node.timeToRead,
        category: frontmatter.category,
        source: frontmatter.source
      };
    });
  }
  render() {
    return (
      <div className="post-listing">
        {this.getPostList().map(post => <PostBox post={post} key={post.id} />)}
      </div>
    );
  }
}

export default PostListing;
