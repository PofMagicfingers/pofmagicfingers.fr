import React from "react";
import Helmet from "react-helmet";
import config from "../../../data/SiteConfig";
import "./index.scss";

export default class DefaultLayout extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <div>
        <Helmet>
          <title>{config.siteTitle}</title>
          <meta name="description" content={config.siteDescription} />
        </Helmet>
        <header className="site-header">
          <img className="logo" src={config.siteMascot} />
          <p className="description">{config.siteDescription}</p>
        </header>
        {children()}
      </div>
    );
  }
}
