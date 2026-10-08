"use client";

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Link from "next/link";
import SVG from "@components/svg/component.js";
import Button from "@components/button/component.js";

import * as styles from "./styles.module.scss";

// Section links are stored in Sanity as "#how-it-works" etc. Prefixing "/" makes them
// work from any page (e.g. the 404) while staying a same-page smooth scroll on home.
const toHref = (link = "") => (link.startsWith("#") ? `/${link}` : link);
const toSectionId = (link = "") => (link.includes("#") ? link.split("#")[1] : null);

const COMPACT_AFTER = 80; // px scrolled before the header/logo shrink
const CLICK_LOCK_MS = 1200; // keep a clicked link active while the page smooth-scrolls to it

// The active section is the last one whose top has passed a line ~35% down the
// viewport (below the header). At the very bottom of the page, the last section wins.
const getActiveSectionId = (ids, headerHeight) => {
  const sections = ids
    .map((id) => ({ id, el: document.getElementById(id) }))
    .filter(({ el }) => el)
    .map(({ id, el }) => ({ id, top: el.getBoundingClientRect().top }));
  if (!sections.length) return null;

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) return sections.reduce((a, b) => (b.top > a.top ? b : a)).id;

  const line = headerHeight + window.innerHeight * 0.35;
  const passed = sections.filter((s) => s.top <= line);
  return passed.length ? passed.reduce((a, b) => (b.top > a.top ? b : a)).id : null;
};

// transparentTheme ("light" | "dark" | null): when set, the header has no background
// at the top of the page so the first section shows through; "dark" switches to light
// text/logo for navy or background-image sections. It turns solid once scrolled.
export const Header = ({ links = [], transparentTheme = null }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const headerRef = useRef(null);
  const clickLockRef = useRef(null); // timeout id while a clicked link is "locked" active

  const sectionIds = links.map((item) => toSectionId(item.link)).filter(Boolean).join(",");

  // Scroll state: shadow, compact logo, and which section's link is active
  useEffect(() => {
    const ids = sectionIds ? sectionIds.split(",") : [];
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
      setCompact(window.scrollY > COMPACT_AFTER);
      if (clickLockRef.current) return;
      setActiveId(getActiveSectionId(ids, headerRef.current?.offsetHeight || 0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(clickLockRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionIds]);

  const isTransparent = Boolean(transparentTheme) && !scrolled && !menuOpen;

  const handleLinkClick = (link) => {
    setMenuOpen(false);
    const id = toSectionId(link);
    if (id && document.getElementById(id)) {
      setActiveId(id);
      clearTimeout(clickLockRef.current);
      clickLockRef.current = setTimeout(() => {
        clickLockRef.current = null;
      }, CLICK_LOCK_MS);
    }
  };

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
    <>
      <div
        className={classNames(styles.overlay, { [styles.overlayOpen]: menuOpen })}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <header
        ref={headerRef}
        className={classNames(styles.header, {
          [styles.scrolled]: scrolled && !menuOpen, // shadow only — none while the menu is open
          [styles.compact]: compact,
          [styles.transparent]: isTransparent,
          [styles.transparentDark]: isTransparent && transparentTheme === "dark",
        })}
      >
        <div className={styles.inner}>
          <Link
            href="/"
            prefetch={false} // one-page site — prefetching "/" data is a wasted request
            className={styles.logo}
            onClick={() => setMenuOpen(false)}
          >
            <SVG name="logo" />
            {/* Real link text (not aria-label) so SEO checkers see an anchor text */}
            <span className="sr-only">Run With Nicole – Home</span>
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
              {links.map((item, i) => {
                const isActive = Boolean(activeId) && toSectionId(item.link) === activeId;
                return (
                  <li key={item._key || i}>
                    {item.displayAsButton ? (
                      // Same Button component as the rest of the site, so styles always match
                      <Button
                        to={toHref(item.link)}
                        theme="teal"
                        className={styles.headerButton}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => handleLinkClick(item.link)}
                      >
                        {item.label}
                      </Button>
                    ) : (
                      <a
                        href={toHref(item.link)}
                        className={classNames(styles.link, { [styles.active]: isActive })}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => handleLinkClick(item.link)}
                      >
                        <span className={styles.label}>{item.label}</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

Header.propTypes = {
  transparentTheme: PropTypes.oneOf(["light", "dark"]),
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
