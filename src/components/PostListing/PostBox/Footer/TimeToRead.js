import React from "react";

import FontAwesome from "react-fontawesome";

const TimeToRead = ({ post }) => {
  const ttr = post.customTimeToRead || post.timeToRead;
  const hours = Math.floor(ttr / 60);
  const minutes = ttr - hours * 60;

  return minutes ? (
    <h5 className="timeToRead">
      <FontAwesome name="clock-o" />&nbsp;
      {hours ? `${hours} h ${`00${minutes}`.slice(-2)} min` : `${minutes} min`}
    </h5>
  ) : null;
};

export default TimeToRead;
