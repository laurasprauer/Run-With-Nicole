import React from "react";
import PropTypes from "prop-types";
import { PortableText } from "@portabletext/react";
import Button from "@components/button/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getButtonTheme } from "@utils/getButtonTheme.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

// Full-width callout band (its own section, always teal): text on the left, one button
// on the right with an abstract "target" (concentric rings) behind it, stacked and
// centered on phones.
// The button downloads `downloadFileUrl` when a file is uploaded in Sanity; otherwise
// it links to `componentButtonLink`. No file and no link → no button.
// The download uses the `download` attribute, not Sanity's `?dl=` param, so the link has
// no query string (SEO checkers flag "dynamic parameters"). On Netlify the file is served
// from our own domain (/sanity-files/… proxy), where `download` works; the URL already
// ends in the readable filename (vanity filename from generatePageData).
export const CtaBanner = ({
  body,
  componentButtonLabel,
  componentButtonLink,
  downloadFileUrl,
  removeTopPadding,
  removeBottomPadding,
}) => {
  // Always teal: the target decoration is designed for it, so the Studio doesn't offer a
  // background color for banners and any stored value is ignored.
  const bgColor = "teal";
  const containerClasses = getSectionClasses(styles, {
    componentBgColor: bgColor,
    removeTopPadding,
    removeBottomPadding,
  });

  const href = downloadFileUrl || componentButtonLink;

  return (
    <div className={containerClasses}>
      <div className={styles.wrapper}>
        <div className={styles.body}>
          {Array.isArray(body) && <PortableText value={body} components={portableTextComponents} />}
        </div>
        {componentButtonLabel && href && (
          <div className={styles.buttonWrapper}>
            {/* Decorative target rings behind the button (CSS only) */}
            <span className={styles.target} aria-hidden="true" />
            <Button
              to={href}
              theme={getButtonTheme(bgColor)}
              {...(downloadFileUrl && { download: "" })}
            >
              {componentButtonLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

CtaBanner.propTypes = {
  body: PropTypes.array,
  componentButtonLabel: PropTypes.string,
  componentButtonLink: PropTypes.string,
  downloadFileUrl: PropTypes.string,
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default CtaBanner;
