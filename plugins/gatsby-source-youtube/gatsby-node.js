var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const Parser = require("rss-parser");
const crypto = require("crypto");
const YouTube = require("youtube-api");
var chunk = require("lodash.chunk");
var get = require("lodash.get");

const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

/* Utils */

const empty = o => !o || typeof o !== "string" || !o.trim().length;

const createContentDigest = obj => crypto.createHash("md5").update(JSON.stringify(obj)).digest("hex");

/* YouTube */

const promisify = fn => options => new Promise((res, rej) => {
  fn(options, (err, data) => {
    err && rej(err) && console.log(err) || res(data);
  });
});

const YouTubeSearch = promisify(YouTube.search.list);

const YouTubeVideo = promisify(YouTube.videos.list);

const YouTubeChannel = promisify(YouTube.channels.list);

const getThumbnail = ts => ["default", "medium", "high", "standard", "maxres"].reduce((biggest, curr) => get(ts, `${curr}.url`) || biggest);

async function getYouTubeChannel(channelId) {
  const channelInfos = (await YouTubeChannel({
    part: "snippet",
    id: channelId,
    fields: "items(id,snippet(customUrl,description,publishedAt,thumbnails(default/url,high/url,maxres/url,medium/url,standard/url),title))"
  })).items[0];

  return {
    id: channelId,
    title: get(channelInfos, "snippet.title"),
    description: get(channelInfos, "snippet.title"),
    publishedAt: get(channelInfos, "snippet.publishedAt"),
    thumbnailUrl: getThumbnail(get(channelInfos, "snippet.thumbnails")),
    link: `https://youtube.com/channel/${channelId}`,
    videos: await getYouTubeVideos(channelId)
  };
}

const YTDurationToSeconds = duration => {
  if (empty(duration)) return 0;

  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  match = match.slice(1).map(function (x) {
    if (x != null) {
      return x.replace(/\D/, "");
    }
  });

  var hours = parseInt(match[0]) || 0;
  var minutes = parseInt(match[1]) || 0;
  var seconds = parseInt(match[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
};

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

    results.push(...query.items.filter(a => a && a.id && a.id.kind === "youtube#video").map(a => a.id.videoId));

    nextPageToken = query.nextPageToken;

    if (!nextPageToken) break;
  }

  return [].concat(...(await Promise.all(chunk(results).map(ids => {
    return YouTubeVideo({
      part: "snippet,contentDetails",
      id: ids,
      fields: "items(id,snippet(description,publishedAt,tags,thumbnails(default/url,high/url,maxres/url,medium/url,standard/url),title),contentDetails(duration))"
    });
  }))).map(v => v && v.items || []));
}

/* Node creations */

const createThumbnailNode = async (node, store, cache, createNode) => {
  if (node && !empty(node.thumbnailUrl)) {
    let fileNode;
    try {
      console.log("Downloading " + node.thumbnailUrl);
      fileNode = await createRemoteFileNode({
        url: node.thumbnailUrl,
        store,
        cache,
        createNode,
        auth: _auth
      });
    } catch (e) {
      // Ignore
    }

    if (fileNode) {
      node.thumbnailFile__NODE = fileNode.id;
    }
  }

  return node;
};

const defaultMediaType = entry => "text/html";
const defaultTemplate = entry => `<iframe width="560" height="315" src="https://www.youtube.com/embed/${entry["yt:videoId"]}?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

const createChildren = async ({ boundActionCreators, store, cache }, {
  parentId,
  childNode,
  nodeMediaType = defaultMediaType,
  nodeTemplate = defaultTemplate
}) => {
  const { createNode } = boundActionCreators;

  const getMediaType = typeof nodeMediaType === "function" ? nodeMediaType : () => nodeMediaType;
  const getContent = typeof nodeTemplate === "function" ? nodeTemplate : () => nodeTemplate;

  const nodeData = _extends({}, childNode, {
    parent: parentId,
    children: [],
    internal: {
      type: "YouTubeVideo",
      mediaType: getMediaType(childNode, parentId),
      content: getContent(childNode, parentId),
      contentDigest: createContentDigest(childNode)
    }
  });

  console.log(`Creating video thumbnail node for ${nodeData.id}`);
  await createThumbnailNode(nodeData, store, cache, createNode);

  console.log(`Creating video node for ${nodeData.id}`);
  createNode(nodeData);

  return childNode.id;
};

exports.sourceNodes = async ({ boundActionCreators, store, cache }, {
  channelId,
  channelIds,
  YouTubeAPIKey,
  nodeMediaType = defaultMediaType,
  nodeTemplate = defaultTemplate
}) => {
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
      thumbnailUrl: channel.thumbnailUrl,
      createdAt: new Date(Date.parse(channel.publishedAt)),
      parent: null
    };

    console.log(`Creating channel thumbnail node for node ${channelNode.id}`);
    await createThumbnailNode(channelNode, store, cache, createNode);

    channelNode.children = [];

    for (let index = 0; index < channel.videos.length; index++) {
      const video = channel.videos[index];
      channelNode.children.push((await createChildren({ boundActionCreators, store, cache }, {
        childNode: {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnailUrl: getThumbnail(get(video, "snippet.thumbnails")),
          duration: YTDurationToSeconds(get(video, "contentDetails.duration")),
          tags: video.snippet.tags,
          publishedAt: new Date(Date.parse(video.snippet.publishedAt)),
          link: `https://youtube.com/watch?v=${video.id}`
        },
        parentId: channelId,
        nodeMediaType,
        nodeTemplate
      })));
    }

    channelNode.internal = {
      type: "YouTubeChannel",
      contentDigest: createContentDigest(channelNode)
    };

    console.log(`Creating channel node ${channelNode.id}`);
    createNode(channelNode);
  };

  return await Promise.all(channels.map(channel => createAllNodes(channel)));
};