import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import SVG from "@components/svg/component.js";

import * as styles from "./styles.module.scss";

// "https://www.instagram.com/run.with.nicole.la/" → "@run.with.nicole.la"
const toInstagramHandle = (url = "") => {
  const handle = url.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").split(/[/?#]/)[0];
  return handle ? `@${handle}` : "Instagram";
};

// Logo, contact email, social icon(s) and copyright. Intentionally no nav links.
export const Footer = ({ email, instagramUrl }) => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" prefetch={false} className={styles.logo} aria-label="Run With Nicole — home">
          <SVG name="logo" />
        </Link>

        {email && (
          <a href={`mailto:${email}`} className={styles.email}>
            <span className={styles.emailIcon}>
              <SVG name="email" />
            </span>
            {email}
          </a>
        )}

        {instagramUrl && (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.email}>
            <span className={styles.emailIcon}>
              <SVG name="instagram" />
            </span>
            {toInstagramHandle(instagramUrl)}
            <span className="sr-only"> on Instagram (opens in a new tab)</span>
          </a>
        )}

        <p className={styles.copyright}>© {year} Run With Nicole. All rights reserved.</p>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  email: PropTypes.string,
  instagramUrl: PropTypes.string,
};

export default Footer;
