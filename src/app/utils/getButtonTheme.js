// Button theme that reads well on a given section background (componentBgColor).
// Keep in sync with the section-bg mixin (styles/mixins/_layout.scss).
const BUTTON_THEME_BY_BG = {
  white: "navy",
  offWhite: "navy",
  teal: "navy",
  navy: "teal",
};

export const getButtonTheme = (componentBgColor) => BUTTON_THEME_BY_BG[componentBgColor] || "navy";

export default getButtonTheme;
