import fs from "fs";
import path from "path";
import Head from "next/head";
import Header from "@components/header/component.js";
import Footer from "@components/footer/component.js";
import MainContent from "@components/mainContent/component.js";
import NotFound from "@components/notFound/component.js";
import { buildStructuredData } from "@utils/structuredData.js";

// Every page is built from public/static-page-data.json (written at build time by
// src/app/utils/generatePageData.cjs). Nothing fetches Sanity in the browser.
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", file), "utf-8"));

export async function getStaticPaths() {
  const slugs = readJson("static-slugs.json");
  return {
    paths: slugs.map((slug) => ({ params: { slug: slug === "/" ? [] : slug.split("/") } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const data = readJson("static-page-data.json");
  const slug = params?.slug?.length ? params.slug.join("/") : "/";
  const page = data.pages[slug] || null;

  return {
    props: {
      page,
      navigation: data.navigation || {},
      slug,
    },
  };
}

// The header is transparent at the top of content pages and shows the first
// section's background. "dark" = navy or a background image → light header text.
const getTransparentHeaderTheme = (page) => {
  const first = page?.mainContent?.[0];
  if (!first) return null;
  const isDark = first.componentBgColor === "navy" || Boolean(first.backgroundImage?.asset?.url);
  return isDark ? "dark" : "light";
};

export default function Page({ page, navigation, slug }) {
  const transparentTheme = getTransparentHeaderTheme(page);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const structuredData = slug === "/" ? buildStructuredData({ page, navigation, siteUrl }) : null;

  return (
    <>
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            // "<" is escaped so content can never close the script tag early
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
          />
        </Head>
      )}
      <Header links={navigation.links} transparentTheme={transparentTheme} />
      <main className={transparentTheme ? "has-transparent-header" : undefined}>
        {page ? (
          <MainContent data={page.mainContent} seo={page.seo} slug={slug} />
        ) : (
          <>
            <Head>
              <title>Page Not Found | Run With Nicole</title>
            </Head>
            <NotFound />
          </>
        )}
      </main>
      <Footer email={navigation.footerEmail} />
    </>
  );
}
