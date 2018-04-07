import React from "react";

import Moment from "react-moment";
import "moment/locale/fr";

const PublishedAt = ({ post }) => (
  <h5 className="publishedAt">
    <Moment fromNow>{post.date}</Moment>
  </h5>
);

export default PublishedAt;
