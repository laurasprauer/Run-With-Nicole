import fs from "fs";
import path from "path";
import Head from "next/head";
import Header from "@components/header/component.js";
import Footer from "@components/footer/component.js";
import MainContent from "@components/mainContent/component.js";
import NotFound from "@components/notFound/component.js";

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

export default function Page({ page, navigation, slug }) {
  return (
    <>
      <Header links={navigation.links} />
      <main>
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
      <Footer email={navigation.footerEmail} slogan={navigation.footerSlogan} />
    </>
  );
}
