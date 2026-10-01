import React from "react";
import PropTypes from "prop-types";
import { PortableText } from "@portabletext/react";
import CustomImage from "@components/customImage/component.js";
import Button from "@components/button/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getButtonTheme } from "@utils/getButtonTheme.js";
import { getSanityRect } from "@utils/getSanityRect.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

// Personal-blog style hero: round profile photo beside the intro text (stacked and
// centered on phones). Optional background image covers the section with a navy
// overlay; it overrides the background color and switches to light text. Framing comes from the image's Sanity crop (zoom in on the face)
// and hotspot (focus point inside that crop), both set in the Studio's image editor.
export const Hero = ({
  body,
  imageUrl,
  imageAlt,
  imageHotspot,
  imageCrop,
  imageWidth,
  imageHeight,
  backgroundImageUrl,
  backgroundImageAlt,
  backgroundImageCrop,
  backgroundImageWidth,
  backgroundImageHeight,
  backgroundImageHotspot,
  componentButtonLabel,
  componentButtonLink,
  componentBgColor,
  removeTopPadding,
  removeBottomPadding,
}) => {
  const hasBackgroundImage = Boolean(backgroundImageUrl);
  const bgColor = hasBackgroundImage ? "navy" : componentBgColor; // light text over the photo
  const containerClasses = getSectionClasses(
    styles,
    { componentBgColor: bgColor, removeTopPadding, removeBottomPadding },
    { [styles.hasBackgroundImage]: hasBackgroundImage }
  );

  const rect = getSanityRect(imageCrop, imageWidth, imageHeight);

  // Hotspot is relative to the full image; convert it to a position inside the crop.
  let objectPosition = "50% 30%";
  if (imageHotspot) {
    const { top = 0, bottom = 0, left = 0, right = 0 } = imageCrop || {};
    const clamp = (n) => Math.min(100, Math.max(0, Math.round(n * 100)));
    const x = (imageHotspot.x - left) / (1 - left - right);
    const y = (imageHotspot.y - top) / (1 - top - bottom);
    objectPosition = `${clamp(x)}% ${clamp(y)}%`;
  }

  return (
    <div className={containerClasses}>
      {hasBackgroundImage && (
        <div className={styles.background} aria-hidden="true">
          <CustomImage
            basePath={backgroundImageUrl}
            alt={backgroundImageAlt}
            width={backgroundImageWidth}
            height={backgroundImageHeight}
            rect={getSanityRect(backgroundImageCrop, backgroundImageWidth, backgroundImageHeight)}
            // Always anchored to the top; the hotspot (if set) only picks the horizontal focus
            objectPosition={`${backgroundImageHotspot ? Math.round(backgroundImageHotspot.x * 100) : 50}% 0%`}
            widths={[800, 1400, 2000, 2600]}
            sizes="100vw"
            priority
          />
        </div>
      )}
      <div className={styles.wrapper}>
        {imageUrl && (
          <div className={styles.photo}>
            <CustomImage
              basePath={imageUrl}
              alt={imageAlt}
              widths={[200, 400, 600]}
              sizes="(max-width: 719px) 180px, 280px"
              objectPosition={objectPosition}
              rect={rect}
              width={imageWidth}
              height={imageHeight}
              priority
            />
          </div>
        )}
        <div className={styles.body}>
          {Array.isArray(body) && <PortableText value={body} components={portableTextComponents} />}
          {componentButtonLabel && componentButtonLink && (
            <div className={styles.buttonWrapper}>
              <Button to={componentButtonLink} theme={getButtonTheme(bgColor)}>
                {componentButtonLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Hero.propTypes = {
  body: PropTypes.array,
  imageUrl: PropTypes.string,
  imageAlt: PropTypes.string,
  imageHotspot: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
  imageCrop: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
  }),
  imageWidth: PropTypes.number,
  imageHeight: PropTypes.number,
  backgroundImageUrl: PropTypes.string,
  backgroundImageAlt: PropTypes.string,
  backgroundImageCrop: PropTypes.object,
  backgroundImageWidth: PropTypes.number,
  backgroundImageHeight: PropTypes.number,
  backgroundImageHotspot: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
  componentButtonLabel: PropTypes.string,
  componentButtonLink: PropTypes.string,
  componentBgColor: PropTypes.oneOf(["white", "offWhite", "teal", "navy"]),
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default Hero;
