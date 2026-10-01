import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CustomLink from "@components/customLink/component.js";

import * as styles from "./styles.module.scss";

// Renders a link when `to` is set, otherwise a <button> (pass `type="submit"` for forms).
// Pick `theme` from the section background with getButtonTheme().
export const Button = ({
  children,
  to,
  target,
  onClick,
  theme = "navy",
  size = "medium",
  width = "auto",
  type = "button",
  disabled,
  className,
  ...rest // extra attributes, e.g. aria-current
}) => {
  const classes = classNames(styles.container, styles[theme], styles[size], styles[width], className);

  if (!to) {
    return (
      <button type={type} className={classes} onClick={onClick} disabled={disabled} data-button {...rest}>
        {children}
      </button>
    );
  }

  return (
    <CustomLink to={to} target={target} className={classes} onClick={onClick} data-button {...rest}>
      {children}
    </CustomLink>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string,
  target: PropTypes.string,
  onClick: PropTypes.func,
  theme: PropTypes.oneOf(["navy", "teal", "outlineWhite"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  width: PropTypes.oneOf(["auto", "full"]),
  type: PropTypes.oneOf(["button", "submit"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};


export default Button;
