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
      <Header links={navigation.links} />
      <main>
        <NotFound />
      </main>
      <Footer email={navigation.footerEmail} slogan={navigation.footerSlogan} />
    </>
  );
}
