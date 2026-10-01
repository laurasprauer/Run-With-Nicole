import React from "react";
import PropTypes from "prop-types";
import { PortableText } from "@portabletext/react";
import Button from "@components/button/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getButtonTheme } from "@utils/getButtonTheme.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

// Full-width callout band (its own section — usually Teal): text on the left, one button
// on the right, stacked and centered on phones.
// The button downloads `downloadFileUrl` when a file is uploaded in Sanity (Sanity's
// `?dl=` param forces a download with the original filename); otherwise it links to
// `componentButtonLink`. No file and no link → no button.
export const CtaBanner = ({
  body,
  componentButtonLabel,
  componentButtonLink,
  downloadFileUrl,
  componentBgColor,
  removeTopPadding,
  removeBottomPadding,
}) => {
  const containerClasses = getSectionClasses(styles, {
    componentBgColor,
    removeTopPadding,
    removeBottomPadding,
  });

  const href = downloadFileUrl ? `${downloadFileUrl}?dl=` : componentButtonLink;

  return (
    <div className={containerClasses}>
      <div className={styles.wrapper}>
        <div className={styles.body}>
          {Array.isArray(body) && <PortableText value={body} components={portableTextComponents} />}
        </div>
        {componentButtonLabel && href && (
          <div className={styles.buttonWrapper}>
            <Button
              to={href}
              theme={getButtonTheme(componentBgColor)}
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
  componentBgColor: PropTypes.oneOf(["white", "offWhite", "teal", "navy"]),
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default CtaBanner;
