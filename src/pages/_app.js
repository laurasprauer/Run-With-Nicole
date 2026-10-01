import "../app/styles/global-styles.scss";

import { Open_Sans } from "next/font/google";

// One variable font file covers every weight AND width: the `wdth` axis (75–100%)
// gives Open Sans Condensed for headings via `font-stretch` (see global-styles.scss).
// display: "optional" — the font is preloaded, so it's normally ready for first paint;
// if it isn't (very slow first visit) the fallback is kept rather than swapped in later.
// Swapping caused a layout shift: the fallback can't render the condensed (75%) width,
// so headings reflowed when Open Sans arrived.
const openSans = Open_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "optional",
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-open-sans: ${openSans.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
