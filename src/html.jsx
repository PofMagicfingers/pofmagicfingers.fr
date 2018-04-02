/* eslint import/no-unresolved:"off" */
/* eslint import/extensions:"off" */
/* eslint global-require:"off" */
import React from "react";

import moment from "moment/min/moment-with-locales";
import Moment from "react-moment";
import "moment/locale/fr";

Moment.globalMoment = moment;
Moment.globalLocale = "fr";

import * as favicons from "../static/logos/favicons";

let inlinedStyles = "";
if (process.env.NODE_ENV === "production") {
  try {
    /* eslint import/no-webpack-loader-syntax: off */
    inlinedStyles = require("!raw-loader!../public/styles.css");
  } catch (e) {
    /* eslint no-console: "off" */
    console.log(e);
  }
}

export default class HTML extends React.Component {
  render() {
    let css;
    if (process.env.NODE_ENV === "production") {
      css = (
        <style
          id="gatsby-inlined-css"
          dangerouslySetInnerHTML={{ __html: inlinedStyles }}
        />
      );
    }

    favicons = [
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={favicons.appleTouchIcon}
      />,
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={favicons.favicon32}
      />,
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={favicons.favicon16}
      />,
      <link rel="mask-icon" href={favicons.maskIcon} color="#404040" />,
      <meta name="msapplication-TileColor" content="#000000" />,
      <meta name="msapplication-TileImage" content={favicons.mstile} />
    ];

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {this.props.headComponents}
          {favicons}
          {css}
        </head>
        <body>
          <div
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    );
  }
}
