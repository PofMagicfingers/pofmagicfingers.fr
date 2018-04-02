const process = require("process");
const yamljs = require("yamljs");

const channels = {
  UCJpXhQlrx8c1ObNYd5KIZRg: "PofMagicfingers",
  "UCx_fJn0Lyfp_9o-x5HRhSYg": "ThePofPlayer",
  "UCnoQg3q-ybMjU43TXDOt9Kw": "PofMagicfingersVlogs"
};

const templateMediaType = (node, parentId) => "text/markdown";
const templateEngine = (node, parentId) => {
  const tags = [
    ...new Set(
      [channels[parentId], "youtube", "video"]
        .concat(node.tags)
        .filter(v => typeof v === "string" && v.length)
    )
  ];

  const frontmatter = {
    title: node.title,
    cover: node.thumbnail,
    category: "YouTube",
    date: node.publishedAt,
    source: channels[parentId],
    tags
  };

  const template = `
---
${yamljs.stringify(frontmatter).trim()}
---
\`youtube: ${node.id}\`

${node.description}
`.trim();

  return template;
};

module.exports = {
  YouTubeAPIKey: process.env.YOUTUBE_API_KEY,
  channelIds: Object.keys(channels),
  nodeMediaType: templateMediaType,
  nodeTemplate: templateEngine
};
