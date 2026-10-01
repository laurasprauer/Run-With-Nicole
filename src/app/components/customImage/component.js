"use client";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import * as styles from "./styles.module.scss";

// Sanity image with a blurred low-res placeholder and a responsive webp srcset
// (Sanity image URLs accept ?w=&q=&fm=&blur=&rect=). Always use this for Sanity images.
// `rect` ("x,y,w,h" in source pixels) crops server-side — see getSanityRect().
export const CustomImage = ({
  basePath,
  alt,
  widths = [400, 800, 1200],
  sizes = "100vw",
  className,
  objectPosition,
  rect,
  priority = false,
}) => {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(priority);

  // Cached images can finish loading before hydration, so onLoad never fires.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  if (!basePath) return null;

  const base = rect ? `${basePath}?rect=${rect}&` : `${basePath}?`;
  const srcSet = widths.map((w) => `${base}w=${w}&q=75&fm=webp ${w}w`).join(", ");
  const fullSize = `${base}w=${widths[widths.length - 1]}&q=75&fm=webp`;
  const lowQuality = `${base}w=${Math.round(widths[0] / 4)}&q=10&blur=60&fm=webp`;

  return (
    <div className={classNames(styles.imageWrapper, className)}>
      <div
        aria-hidden="true"
        style={{ backgroundImage: `url(${lowQuality})` }}
        className={classNames(styles.imageBlur, { [styles.loaded]: loaded })}
      />
      <img
        ref={imgRef}
        src={fullSize}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || ""}
        style={objectPosition ? { objectPosition } : undefined}
        className={classNames(styles.imageFull, { [styles.loaded]: loaded })}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

CustomImage.propTypes = {
  basePath: PropTypes.string,
  alt: PropTypes.string,
  widths: PropTypes.arrayOf(PropTypes.number),
  sizes: PropTypes.string,
  className: PropTypes.string,
  objectPosition: PropTypes.string,
  rect: PropTypes.string,
  priority: PropTypes.bool,
};


export default CustomImage;
