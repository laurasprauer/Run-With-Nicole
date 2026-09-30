import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { PortableText } from "@portabletext/react";
import CustomImage from "@components/customImage/component.js";
import Button from "@components/button/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getButtonTheme } from "@utils/getButtonTheme.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

// Text beside an image. `imageFit` changes WHERE the image is rendered:
//  - "cover":   image is a sibling of .wrapper, absolutely positioned to fill 50% of
//               the section edge-to-edge (full-bleed), cropped with object-fit: cover.
//  - "contain": image sits INSIDE .wrapper (within the max-width column) as a flex
//               item, scaled with object-fit: contain — nothing is cropped.
// With no image uploaded the text simply runs full width.
export const ImageWithText = ({
  body,
  imageUrl,
  imageAlt,
  leftOrRight = "right",
  imageFit = "cover",
  componentButtonLabel,
  componentButtonLink,
  componentBgColor,
  removeTopPadding,
  removeBottomPadding,
}) => {
  const hasImage = Boolean(imageUrl);
  const isContain = imageFit === "contain";
  const side = leftOrRight === "left" ? "left" : "right";

  const containerClasses = getSectionClasses(
    styles,
    { componentBgColor, removeTopPadding, removeBottomPadding },
    {
      [styles.hasImage]: hasImage,
      [styles.imageFitContain]: isContain,
      [styles.imageFitCover]: !isContain,
      [styles.imageLeft]: side === "left",
      [styles.imageRight]: side === "right",
    }
  );

  const image = hasImage ? (
    <div className={classNames(styles.componentImage, styles[side])}>
      <CustomImage
        basePath={imageUrl}
        alt={imageAlt}
        widths={isContain ? [400, 700, 1000] : [500, 800, 1100, 1500]}
        sizes={isContain ? "(max-width: 999px) 100vw, 620px" : "(max-width: 1140px) 100vw, 50vw"}
      />
    </div>
  ) : null;

  const content = (
    <div className={styles.body}>
      {Array.isArray(body) && <PortableText value={body} components={portableTextComponents} />}
      {componentButtonLabel && componentButtonLink && (
        <div className={styles.buttonWrapper}>
          <Button to={componentButtonLink} theme={getButtonTheme(componentBgColor)}>
            {componentButtonLabel}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className={containerClasses}>
      {!isContain && side === "left" && image}
      <div className={styles.wrapper}>
        {isContain && side === "left" && image}
        {content}
        {isContain && side === "right" && image}
      </div>
      {!isContain && side === "right" && image}
    </div>
  );
};

ImageWithText.propTypes = {
  body: PropTypes.array,
  imageUrl: PropTypes.string,
  imageAlt: PropTypes.string,
  leftOrRight: PropTypes.oneOf(["left", "right"]),
  imageFit: PropTypes.oneOf(["cover", "contain"]),
  componentButtonLabel: PropTypes.string,
  componentButtonLink: PropTypes.string,
  componentBgColor: PropTypes.oneOf(["white", "navy"]),
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default ImageWithText;
