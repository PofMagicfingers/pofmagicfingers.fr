const process = require("process");

module.exports = {
  blogPostDir: "blog", // The name of directory that contains your posts.
  youtubeUsername: "PofMagicfingers",
  youtubeChannelId: "UCJpXhQlrx8c1ObNYd5KIZRg",
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  siteTitle: "Pof Magicfingers", // Site title.
  siteTitleAlt: "Le bordel de Pof Magicfingers", // Alternative site title for SEO.
  siteLogo: "/logos/logo-1024.png", // Logo used for SEO and manifest.
  siteUrl: "https://pofmagicfingers.fr", // Domain of your website without pathPrefix.
  pathPrefix: "/", // Prefixes all links. For cases when deployed to example.github.io/gatsby-advanced-starter/.
  siteDescription: "Le bordel de Pof Magicfingers", // Website description used for RSS feeds/meta description tag.
  siteRss: "/rss.xml", // Path to the RSS file.
  siteFBAppID: "188556681931474", // FB Application ID for using app insights
  googleAnalyticsID: "UA-35721571-1", // GA tracking ID.
  disqusShortname: "pofmagicfingers", // Disqus shortname.
  postDefaultCategoryID: "Blog", // Default category for posts.
  userName: "PofMagicfingers", // Username to display in the author segment.
  userTwitter: "PofMagicfingers", // Optionally renders "Follow Me" in the UserInfo segment.
  userLocation: "Toulouse, France", // User location to display in the author segment.
  userAvatar:
    "https://gravatar.com/avatar/b9d8c763961a4168fb49f9dc0f214802?s=200", // User avatar to display in the author segment.
  userDescription:
    "Classé inutile au patrimoine mondial de l'UNESCO depuis 1992. Fondateur de podradio.fr, podCloud, PodShows - Développeur @ commit42, Podcasteur, Youtuber.", // User description to display in the author segment.
  // Links to social profiles/projects you want to display in the author segment/navigation bar.
  userLinks: [
    {
      label: "GitHub",
      url: "https://github.com/pofmagicfingers",
      iconClassName: "fa fa-github"
    },
    {
      label: "Twitter",
      url: "https://twitter.com/PofMagicfingers",
      iconClassName: "fa fa-twitter"
    },
    {
      label: "Email",
      url: "mailto:pof@podshows.fr",
      iconClassName: "fa fa-envelope"
    }
  ],
  copyright: `Copyright © ${new Date().getFullYear()} PofMagicfingers`, // Copyright string for the footer of the website and RSS feed.
  themeColor: "#d83e3e", // Used for setting manifest and progress theme colors.
  backgroundColor: "#151515" // Used for setting manifest background color.
};
