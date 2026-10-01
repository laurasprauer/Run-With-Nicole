import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import SVG from "@components/svg/component.js";

import * as styles from "./styles.module.scss";

// Logo, contact email and copyright. Intentionally no nav links.
export const Footer = ({ email }) => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Run With Nicole — home">
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

        <p className={styles.copyright}>© {year} Run With Nicole. All rights reserved.</p>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  email: PropTypes.string,
};

export default Footer;
