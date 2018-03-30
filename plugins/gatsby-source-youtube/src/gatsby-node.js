const Parser = require("rss-parser");
const crypto = require("crypto");
const parser = new Parser({
  customFields: {
    feed: ['yt:channelId'],
    item: ['yt:videoId','yt:channelId', 'media:group'],
  }
});

const createContentDigest = obj =>
  crypto
    .createHash("md5")
    .update(JSON.stringify(obj))
    .digest("hex");

const createChildren = ({ boundActionCreators }, { channelId, entry, nodeMediaType = defaultMediaType, nodeTemplate = defaultTemplate }) => {
  const { createNode } = boundActionCreators;

  const getMediaType = typeof nodeMediaType === "function" ? nodeMediaType : () => nodeMediaType;
  const getContent = typeof nodeTemplate === "function" ? nodeTemplate : () => nodeTemplate;

  createNode({
    rssEntry: entry,
    id: entry.link,
    title: entry.title,
    link: entry.link,
    description: entry.description,
    parent: channelId,
    children: [],
    internal: {
      type: "YouTubeVideo",
      mediaType: getMediaType(entry),
      content: getContent(entry),
      contentDigest: createContentDigest(entry)
    }
  });

  return entry.link;
};

const defaultMediaType = (entry) => "text/html";
const defaultTemplate = (entry) => `<iframe width="560" height="315" src="https://www.youtube.com/embed/${entry["yt:videoId"]}?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

async function sourceNodes({ boundActionCreators }, { channelId, nodeMediaType = defaultMediaType, nodeTemplate = defaultTemplate }) {
  const { createNode } = boundActionCreators;
  
  const data = await parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );

  if (!data) {
    return;
  }

  const { title, description, link, items } = data;
  
  const childrenIds = items.map((entry) => createChildren({ boundActionCreators }, { entry, channelId, nodeMediaType, nodeTemplate })); 
  
  const feedStory = {
    id: channelId,
    title,
    description,
    link,
    parent: null,
    children: childrenIds
  };

  feedStory.internal = {
    type: "YouTubeChannel",
    contentDigest: createContentDigest(feedStory)
  };

  createNode(feedStory);
}

exports.sourceNodes = sourceNodes;