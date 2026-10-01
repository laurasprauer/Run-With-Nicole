import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Icons: SVG for modern browsers, PNG fallbacks (48px also suits Google's search
            results), Apple touch icon, and the web manifest. PNGs are rendered from
            favicon.svg — see CLAUDE.md → "Icons". */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#266090" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
