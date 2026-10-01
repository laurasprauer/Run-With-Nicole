import React from "react";
import PropTypes from "prop-types";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

// Optional intro + boxes of rich text (title + body), 2 per row (1 on phones).
// Boxes have a plain dashed outline.
export const TextBoxes = ({
  body,
  textBoxItems = [],
  componentBgColor,
  removeTopPadding,
  removeBottomPadding,
}) => {
  const containerClasses = getSectionClasses(styles, {
    componentBgColor,
    removeTopPadding,
    removeBottomPadding,
  });

  return (
    <div className={containerClasses}>
      <div className={styles.wrapper}>
        {Array.isArray(body) && body.length > 0 && (
          <div className={styles.intro}>
            <PortableText value={body} components={portableTextComponents} />
          </div>
        )}
        <div className={styles.grid}>
          {textBoxItems.map((box, i) => (
            <div key={box._key || i} className={styles.box}>
              {box.title && <h3 className={styles.title}>{box.title}</h3>}
              {Array.isArray(box.body) && (
                <PortableText value={box.body} components={portableTextComponents} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

TextBoxes.propTypes = {
  body: PropTypes.array,
  textBoxItems: PropTypes.arrayOf(
    PropTypes.shape({
      _key: PropTypes.string,
      title: PropTypes.string,
      body: PropTypes.array,
    })
  ),
  componentBgColor: PropTypes.oneOf(["white", "offWhite", "teal", "navy"]),
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default TextBoxes;
