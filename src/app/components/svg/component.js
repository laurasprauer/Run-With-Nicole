import React from "react";
import PropTypes from "prop-types";
import svgs from "./svgs";

// Unknown names render nothing. SVGs are decorative (aria-hidden) — put accessible
// text on the parent link/button instead.
const SVG = ({ name }) => {
  const svg = svgs[name];
  if (!svg) return null;
  return React.cloneElement(svg, { "aria-hidden": true, focusable: "false" });
};

SVG.propTypes = {
  name: PropTypes.string.isRequired,
};

export default SVG;
