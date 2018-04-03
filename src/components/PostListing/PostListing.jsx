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
        customTimeToRead: postEdge.node.frontmatter.timeToRead,
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

    const TimeToRead = ({ post }) => {
      const ttr = post.customTimeToRead || post.timeToRead;
      const hours = Math.floor(ttr / 60);
      const minutes = ttr - hours * 60;

      return minutes ? (
        <h5 className="timeToRead">
          <FontAwesome name="clock-o" />&nbsp;
          {hours
            ? `${hours} h ${`00${minutes}`.slice(-2)} min`
            : `${minutes} min`}
        </h5>
      ) : null;
    };

    const PublishedAt = ({ post }) => (
      <h5 className="publishedAt">
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
        <TimeToRead post={post} />
        <Category post={post} />
        <PublishedAt post={post} />
      </footer>
    );

    return (
      <div className="post-listing">
        {/* Your post list here. */
        postList.map(post => (
          <article className="post-box" key={post.title}>
            <header className="post-header">
              <Link to={post.path}>
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
