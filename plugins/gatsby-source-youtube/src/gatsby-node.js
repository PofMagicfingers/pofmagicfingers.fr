const Parser = require("rss-parser");
const crypto = require("crypto");
const YouTube = require("youtube-api");
var chunk = require("lodash.chunk");
var get = require("lodash.get");

const empty = o => !o || typeof o !== "string" || o.trim().length;

const createContentDigest = obj =>
  crypto
    .createHash("md5")
    .update(JSON.stringify(obj))
    .digest("hex");

const createChildren = (
  { boundActionCreators },
  {
    parentId,
    childNode,
    nodeMediaType = defaultMediaType,
    nodeTemplate = defaultTemplate
  }
) => {
  const { createNode } = boundActionCreators;

  const getMediaType =
    typeof nodeMediaType === "function" ? nodeMediaType : () => nodeMediaType;
  const getContent =
    typeof nodeTemplate === "function" ? nodeTemplate : () => nodeTemplate;

  createNode({
    ...childNode,
    parent: parentId,
    children: [],
    internal: {
      type: "YouTubeVideo",
      mediaType: getMediaType(childNode),
      content: getContent(childNode),
      contentDigest: createContentDigest(childNode)
    }
  });

  return childNode.id;
};

const defaultMediaType = entry => "text/html";
const defaultTemplate = entry =>
  `<iframe width="560" height="315" src="https://www.youtube.com/embed/${
    entry["yt:videoId"]
  }?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

async function sourceNodes(
  { boundActionCreators },
  {
    channelId,
    YouTubeAPIKey,
    nodeMediaType = defaultMediaType,
    nodeTemplate = defaultTemplate
  }
) {
  const { createNode } = boundActionCreators;

  YouTube.authenticate({
    type: "key",
    key: YouTubeAPIKey
  });

  const channel = await getYouTubeChannel(channelId);

  const channelNode = {
    id: channel.id,
    title: channel.title,
    description: channel.description,
    link: channel.link,
    createdAt: new Date(Date.parse(channel.publishedAt)),
    parent: null
  };

  channelNode.children = channel.videos.map(video =>
    createChildren(
      { boundActionCreators },
      {
        childNode: {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: get(video, "snippet.thumbnails.maxres.url"),
          tags: video.snippet.tags,
          publishedAt: new Date(Date.parse(video.snippet.publishedAt)),
          link: `https://youtube.com/watch?v=${video.id}`
        },
        parentId: channelId,
        nodeMediaType,
        nodeTemplate
      }
    )
  );

  channelNode.internal = {
    type: "YouTubeChannel",
    contentDigest: createContentDigest(channelNode)
  };

  createNode(channelNode);
}

const promisify = fn => options =>
  new Promise((res, rej) => {
    fn(options, (err, data) => {
      (err && rej(err)) || res(data);
    });
  });

const YouTubeSearch = promisify(YouTube.search.list);

const YouTubeVideo = promisify(YouTube.videos.list);

const YouTubeChannel = promisify(YouTube.channels.list);

async function getYouTubeChannel(channelId) {
  const channelInfos = (await YouTubeChannel({
    part: "snippet",
    id: channelId,
    fields:
      "items(id,snippet(customUrl,description,publishedAt,thumbnails/maxres/url,title))"
  })).items[0];

  return {
    id: channelId,
    title: get(channelInfos, "snippet.title"),
    description: get(channelInfos, "snippet.title"),
    publishedAt: get(channelInfos, "snippet.publishedAt"),
    thumbnail: get(channelInfos, "snippet.thumbnails.maxres.url"),
    link: `https://youtube.com/channel/${channelId}`,
    videos: await getYouTubeVideos(channelId)
  };
}

async function getYouTubeVideos(channelId) {
  let nextPageToken = undefined;

  const results = [];

  while (true) {
    const query = await YouTubeSearch({
      part: "id",
      channelId: channelId,
      maxResults: 50,
      pageToken: nextPageToken,
      order: "date",
      type: "video",
      fields: "items(id(kind,videoId))"
    });

    results.push(
      ...query.items
        .filter(a => a && a.id && a.id.kind === "youtube#video")
        .map(a => a.id.videoId)
    );

    nextPageToken = query.nextPageToken;

    if (!nextPageToken) break;
  }

  return [].concat(
    ...(await Promise.all(
      chunk(results).map(ids => {
        return YouTubeVideo({
          part: "snippet",
          id: ids,
          fields:
            "items(id,snippet(description,publishedAt,tags,thumbnails/maxres/url,title))"
        });
      })
    )).map(v => (v && v.items) || [])
  );
}

exports.sourceNodes = sourceNodes;
