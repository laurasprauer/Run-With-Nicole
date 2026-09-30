import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";

import VideoHero from "@components/videoHero/component.js";
import ImageWithText from "@components/imageWithText/component.js";
import IconBoxes from "@components/iconBoxes/component.js";
import Pricing from "@components/pricing/component.js";
import ContactForm from "@components/contactForm/component.js";
import ClientWrapper from "./clientWrapper.js";

// Shared by every section component.
const sectionProps = (item) => ({
  body: item.body,
  componentBgColor: item.componentBgColor || "white",
  removeTopPadding: item.removeTopPadding,
  removeBottomPadding: item.removeBottomPadding,
  componentButtonLabel: item.componentButtonLabel,
  componentButtonLink: item.componentButtonLink,
});

// Component registry: Sanity `pageComponent` value → React component.
// Adding a component: add it here, in studio/schemaTypes/pageType.js, and in CLAUDE.md.
const renderComponent = (item, index) => {
  switch (item.pageComponent) {
    case "videoHero":
      return (
        <VideoHero
          {...sectionProps(item)}
          backgroundVideoUrl={item.backgroundVideo?.asset?.url}
          fallbackImageUrl={item.fallbackImage?.asset?.url}
          fallbackImageAlt={item.fallbackImage?.alt}
        />
      );
    case "imageWithText":
      return (
        <ImageWithText
          {...sectionProps(item)}
          imageUrl={item.componentImage?.asset?.url}
          imageAlt={item.componentImage?.alt}
          leftOrRight={item.leftOrRight}
          imageFit={item.imageFit}
        />
      );
    case "iconBoxes":
      return <IconBoxes {...sectionProps(item)} boxes={item.boxes} showStepNumbers={item.showStepNumbers} />;
    case "pricing":
      return (
        <Pricing
          {...sectionProps(item)}
          plans={item.plans}
          paymentsTitle={item.paymentsTitle}
          paymentsItems={item.paymentsItems}
        />
      );
    case "contactForm":
      return <ContactForm {...sectionProps(item)} successMessage={item.successMessage} />;
    default:
      if (process.env.NODE_ENV === "development") {
        console.warn(`MainContent: unknown pageComponent "${item.pageComponent}" at index ${index}`);
      }
      return null;
  }
};

export const MainContent = ({ data = [], seo = {}, slug = "/" }) => {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const canonical = `${siteUrl}${slug === "/" ? "/" : `/${slug}`}`;
  const noindex = Boolean(seo.noindex);

  return (
    <ClientWrapper>
      <Head>
        {seo.title && <title>{seo.title}</title>}
        {seo.description && <meta name="description" content={seo.description} />}
        <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
        {siteUrl && <link rel="canonical" href={canonical} />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Run With Nicole" />
        {seo.title && <meta property="og:title" content={seo.title} />}
        {seo.description && <meta property="og:description" content={seo.description} />}
        {siteUrl && <meta property="og:url" content={canonical} />}
        {seo.image && <meta property="og:image" content={seo.image.startsWith("/") ? `${siteUrl}${seo.image}` : seo.image} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {data.map((item, i) => (
        <section key={item._key || i} id={item.containerId || undefined}>
          {renderComponent(item, i)}
        </section>
      ))}
    </ClientWrapper>
  );
};

MainContent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  seo: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    noindex: PropTypes.bool,
    image: PropTypes.string,
  }),
  slug: PropTypes.string,
};

export default MainContent;
