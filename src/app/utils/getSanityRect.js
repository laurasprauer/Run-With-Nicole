// Converts a Sanity image `crop` (fractions trimmed from each edge, set in the Studio's
// image editor) into the `rect=x,y,w,h` URL parameter Sanity's image CDN expects.
// Returns undefined when there's no crop, so the full image is used.
export const getSanityRect = (crop, width, height) => {
  if (!crop || !width || !height) return undefined;
  const { top = 0, bottom = 0, left = 0, right = 0 } = crop;
  if (!top && !bottom && !left && !right) return undefined;
  const x = Math.round(left * width);
  const y = Math.round(top * height);
  const w = Math.round((1 - left - right) * width);
  const h = Math.round((1 - top - bottom) * height);
  return `${x},${y},${w},${h}`;
};

export default getSanityRect;
