import classNames from "classnames";

// Shared section-level classes. The module must include the section-bg and
// section-padding-toggles mixins so .white/.navy/.removeTopPadding/... exist.
export const getSectionClasses = (styles, { componentBgColor, removeTopPadding, removeBottomPadding }, ...extra) =>
  classNames(
    styles.container,
    styles[componentBgColor || "white"],
    {
      [styles.removeTopPadding]: removeTopPadding,
      [styles.removeBottomPadding]: removeBottomPadding,
    },
    ...extra
  );

export default getSectionClasses;
