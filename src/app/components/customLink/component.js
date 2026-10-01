import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";

// Internal page paths ("/", "/about") use next/link. Everything else — same-page
// hashes ("#pricing"), mailto:/tel:, and external URLs — renders a plain <a>, so
// hash links get native smooth scrolling (html { scroll-behavior: smooth }).
const isInternalPath = (to) => typeof to === "string" && to.startsWith("/") && !to.startsWith("//") && !to.includes("#");

const CustomLink = ({ children, to, target, className, ariaLabel, onClick, ...rest }) => {
  const shared = {
    className,
    onClick,
    ...(ariaLabel && { "aria-label": ariaLabel }),
    ...rest,
  };

  if (isInternalPath(to)) {
    return (
      <Link href={to} target={target} prefetch={false} {...shared}>
        {children}
      </Link>
    );
  }

  return (
    <a href={to} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined} {...shared}>
      {children}
    </a>
  );
};

CustomLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string,
  target: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  onClick: PropTypes.func,
};

export default CustomLink;
