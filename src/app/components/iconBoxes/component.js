import React from "react";
import PropTypes from "prop-types";
import { PortableText } from "@portabletext/react";
import SVG from "@components/svg/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

// Optional intro + a grid of icon cards (4 across on desktop, 2 on tablet, 1 on phones).
// Icons are keys from svg/svgs.js, picked in Sanity via studio/components/IconSelector.jsx.
export const IconBoxes = ({
  body,
  boxes = [],
  showStepNumbers,
  componentBgColor,
  removeTopPadding,
  removeBottomPadding,
}) => {
  const containerClasses = getSectionClasses(styles, {
    componentBgColor,
    removeTopPadding,
    removeBottomPadding,
  });

  const hasIntro = Array.isArray(body) && body.length > 0;

  return (
    <div className={containerClasses}>
      <div className={styles.wrapper}>
        {hasIntro && (
          <div className={styles.intro}>
            <PortableText value={body} components={portableTextComponents} />
          </div>
        )}
        <ol className={styles.grid} data-count={boxes.length}>
          {boxes.map((box, i) => (
            <li key={box._key || i} className={styles.box}>
              {box.icon && (
                <div className={styles.iconWrapper}>
                  <SVG name={box.icon} />
                </div>
              )}
              {showStepNumbers && <span className={styles.step}>Step {i + 1}</span>}
              {box.title && <h3 className={styles.title}>{box.title}</h3>}
              {box.text && <p className={styles.text}>{box.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

IconBoxes.propTypes = {
  body: PropTypes.array,
  boxes: PropTypes.arrayOf(
    PropTypes.shape({
      _key: PropTypes.string,
      icon: PropTypes.string,
      title: PropTypes.string,
      text: PropTypes.string,
    })
  ),
  showStepNumbers: PropTypes.bool,
  componentBgColor: PropTypes.oneOf(["white", "navy"]),
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default IconBoxes;
