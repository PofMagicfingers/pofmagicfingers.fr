const Parser = require("rss-parser");
const crypto = require("crypto");
const YouTube = require("youtube-api");
var chunk = require("lodash.chunk");
var get = require("lodash.get");

/* Utils */

const empty = o => !o || typeof o !== "string" || o.trim().length;

const createContentDigest = obj =>
  crypto
    .createHash("md5")
    .update(JSON.stringify(obj))
    .digest("hex");

/* YouTube */

const promisify = fn => options =>
  new Promise((res, rej) => {
    fn(options, (err, data) => {
      (err && rej(err)) || res(data);
    });
  });

const YouTubeSearch = promisify(YouTube.search.list);

const YouTubeVideo = promisify(YouTube.videos.list);

const YouTubeChannel = promisify(YouTube.channels.list);

const getThumbnail = ts =>
  ["default", "medium", "high", "standard", "maxres"].reduce(
    (biggest, curr) => get(ts, `${curr}.url`) || biggest
  );

async function getYouTubeChannel(channelId) {
  const channelInfos = (await YouTubeChannel({
    part: "snippet",
    id: channelId,
    fields:
      "items(id,snippet(customUrl,description,publishedAt,thumbnails(default/url,high/url,maxres/url,medium/url,standard/url),title))"
  })).items[0];

  return {
    id: channelId,
    title: get(channelInfos, "snippet.title"),
    description: get(channelInfos, "snippet.title"),
    publishedAt: get(channelInfos, "snippet.publishedAt"),
    thumbnail: getThumbnail(get(channelInfos, "snippet.thumbnails")),
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
            "items(id,snippet(description,publishedAt,tags,thumbnails(default/url,high/url,maxres/url,medium/url,standard/url),title))"
        });
      })
    )).map(v => (v && v.items) || [])
  );
}

/* Node creations */

const defaultMediaType = entry => "text/html";
const defaultTemplate = entry =>
  `<iframe width="560" height="315" src="https://www.youtube.com/embed/${
    entry["yt:videoId"]
  }?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

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
      mediaType: getMediaType(childNode, parentId),
      content: getContent(childNode, parentId),
      contentDigest: createContentDigest(childNode)
    }
  });

  return childNode.id;
};

exports.sourceNodes = async (
  { boundActionCreators },
  {
    channelId,
    channelIds,
    YouTubeAPIKey,
    nodeMediaType = defaultMediaType,
    nodeTemplate = defaultTemplate
  }
) => {
  const { createNode } = boundActionCreators;

  const channels = [];

  if (!empty(channelId)) channels.push(channelId);
  if (Array.isArray(channelIds)) channels.push(...channelIds);

  YouTube.authenticate({
    type: "key",
    key: YouTubeAPIKey
  });

  const createAllNodes = async channelId => {
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
            thumbnail: getThumbnail(get(video, "snippet.thumbnails")),
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
  };

  return await Promise.all(channels.map(channel => createAllNodes(channel)));
};
