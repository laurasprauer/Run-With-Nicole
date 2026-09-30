"use client";

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Link from "next/link";
import SVG from "@components/svg/component.js";

import * as styles from "./styles.module.scss";

// Section links are stored in Sanity as "#how-it-works" etc. Prefixing "/" makes them
// work from any page (e.g. the 404) while staying a same-page smooth scroll on home.
const toHref = (link = "") => (link.startsWith("#") ? `/${link}` : link);

export const Header = ({ links = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape or a click outside the header
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && setMenuOpen(false);
    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={classNames(styles.header, { [styles.scrolled]: scrolled || menuOpen })}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Run With Nicole — home" onClick={() => setMenuOpen(false)}>
          <SVG name="logo" />
        </Link>

        <button
          type="button"
          className={classNames(styles.menuToggle, { [styles.open]: menuOpen })}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
        </button>

        <nav id="site-nav" className={classNames(styles.nav, { [styles.navOpen]: menuOpen })} aria-label="Main">
          <ul>
            {links.map((item, i) => (
              <li key={item._key || i}>
                <a
                  href={toHref(item.link)}
                  className={classNames(styles.link, { [styles.buttonLink]: item.displayAsButton })}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

Header.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      _key: PropTypes.string,
      label: PropTypes.string,
      link: PropTypes.string,
      displayAsButton: PropTypes.bool,
    })
  ),
};

export default Header;
