"use client";

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { PortableText } from "@portabletext/react";
import Button from "@components/button/component.js";
import CustomImage from "@components/customImage/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { useMediaQuery } from "@utils/useMediaQuery.js";

import * as styles from "./styles.module.scss";

// Full-width hero: muted looping background video + dark overlay + intro copy.
// - The MP4 only loads on screens > 940px (lazy, via IntersectionObserver); smaller
//   screens and prefers-reduced-motion get the fallback image instead.
// - With no video or image uploaded yet, the navy gradient background shows.
export const VideoHero = ({
  body,
  backgroundVideoUrl,
  fallbackImageUrl,
  fallbackImageAlt,
  componentButtonLabel,
  componentButtonLink,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !backgroundVideoUrl || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !window.matchMedia("(max-width: 940px)").matches) {
          setVideoSrc(backgroundVideoUrl);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [backgroundVideoUrl, reducedMotion]);

  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;
    if (reducedMotion) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [reducedMotion, videoSrc]);

  return (
    <div ref={containerRef} className={styles.container}>
      {fallbackImageUrl && (
        <CustomImage
          basePath={fallbackImageUrl}
          alt={fallbackImageAlt || ""}
          className={styles.fallbackImage}
          widths={[600, 1000, 1600, 2000]}
          sizes="100vw"
          priority
        />
      )}

      {backgroundVideoUrl && (
        <div className={styles.videoWrapper} aria-hidden="true">
          <video
            ref={videoRef}
            className={`${styles.bgVideo} ${videoReady ? styles.bgVideoReady : ""}`}
            src={videoSrc || undefined}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="none"
            onCanPlay={() => setVideoReady(true)}
          />
        </div>
      )}

      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.inner}>
          {Array.isArray(body) && body.length > 0 && (
            <div className={styles.body}>
              <PortableText value={body} components={portableTextComponents} />
            </div>
          )}
          {componentButtonLabel && componentButtonLink && (
            <div className={styles.buttonRow}>
              <Button to={componentButtonLink} theme="teal" size="large">
                {componentButtonLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

VideoHero.propTypes = {
  body: PropTypes.array,
  backgroundVideoUrl: PropTypes.string,
  fallbackImageUrl: PropTypes.string,
  fallbackImageAlt: PropTypes.string,
  componentButtonLabel: PropTypes.string,
  componentButtonLink: PropTypes.string,
};

export default VideoHero;
