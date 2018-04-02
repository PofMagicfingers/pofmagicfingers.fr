import React from "react";
import Moment from "react-moment";
import "moment/locale/fr";
import Link from "gatsby-link";
import FontAwesome from "react-fontawesome";

import "./PostListing.scss";

class PostListing extends React.Component {
  getPostList() {
    const postList = [];
    this.props.postEdges.forEach(postEdge => {
      postList.push({
        path: postEdge.node.fields.slug,
        tags: postEdge.node.frontmatter.tags,
        cover: postEdge.node.frontmatter.cover,
        title: postEdge.node.frontmatter.title,
        date: postEdge.node.frontmatter.date,
        excerpt: postEdge.node.excerpt,
        timeToRead: postEdge.node.timeToRead,
        category: postEdge.node.frontmatter.category,
        source: postEdge.node.frontmatter.source
      });
    });
    return postList;
  }
  render() {
    const postList = this.getPostList();

    const PublishedAt = ({ post }) => (
      <h5 className="time">
        <Moment fromNow>{post.date}</Moment>
      </h5>
    );

    const Category = ({ post }) =>
      post.category === "YouTube" ? (
        <h5 className="category">
          <FontAwesome name="youtube" />&nbsp;{post.source}
        </h5>
      ) : null;

    const PostFooter = ({ post }) => (
      <footer className="post-footer">
        <Category post={post} />
        <PublishedAt post={post} />
      </footer>
    );

    return (
      <div className="post-listing">
        {/* Your post list here. */
        postList.map(post => (
          <article class="post-box">
            <header className="post-header">
              <Link to={post.path} key={post.title}>
                {post.cover ? <img src={post.cover} className="cover" /> : null}
                <h3 className="title">{post.title}</h3>
              </Link>
            </header>
            <PostFooter post={post} />
          </article>
        ))}
      </div>
    );
  }
}

export default PostListing;
