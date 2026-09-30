import "../app/styles/global-styles.scss";

import { Open_Sans } from "next/font/google";

// One variable font file covers every weight AND width: the `wdth` axis (75–100%)
// gives Open Sans Condensed for headings via `font-stretch` (see global-styles.scss).
const openSans = Open_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
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
