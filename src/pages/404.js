import fs from "fs";
import path from "path";
import Head from "next/head";
import Header from "@components/header/component.js";
import Footer from "@components/footer/component.js";
import NotFound from "@components/notFound/component.js";

export async function getStaticProps() {
  let navigation = {};
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "static-page-data.json"), "utf-8")
    );
    navigation = data.navigation || {};
  } catch (_) {
    // No generated data yet — render without nav
  }
  return { props: { navigation } };
}

export default function Custom404({ navigation }) {
  return (
    <>
      <Head>
        <title>Page Not Found | Run With Nicole</title>
        <meta name="robots" content="noindex" />
      </Head>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header links={navigation.links} />
      <main id="main-content" tabIndex={-1}>
        <NotFound />
      </main>
      <Footer email={navigation.footerEmail} instagramUrl={navigation.instagramUrl} />
    </>
  );
}
