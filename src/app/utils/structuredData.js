// JSON-LD structured data for the home page (schema.org), rendered by src/pages/[[...slug]].js.
// Helps Google understand the business: a running-coaching service (no street address —
// it's described by the areas it serves), the coach and her RRCA credential, and the
// services/prices from the Pricing section. Validate changes at
// https://search.google.com/test/rich-results or https://validator.schema.org.

// Facts that aren't in Sanity. Keep in sync with the site copy.
const BUSINESS = {
  name: "Run With Nicole",
  coachName: "Nicole",
  jobTitle: "Running Coach",
  credential: {
    name: "RRCA Level 1 Certified Coach",
    issuer: "Road Runners Club of America",
    issuerUrl: "https://www.rrca.org/",
  },
  club: { name: "South Bay Runners Club", url: "https://www.southbayrunners.org/" },
  areaServed: [
    { "@type": "City", name: "Hermosa Beach, CA" },
    { "@type": "City", name: "Manhattan Beach, CA" },
    { "@type": "City", name: "Redondo Beach, CA" },
    { "@type": "Place", name: "South Bay, Los Angeles" },
    { "@type": "AdministrativeArea", name: "Los Angeles County, CA" },
    { "@type": "AdministrativeArea", name: "Orange County, CA" },
  ],
  knowsAbout: [
    "Marathon training",
    "Half marathon training",
    "Race strategy",
    "Run/walk training",
    "Coaching masters runners",
  ],
};

// "$150", "From $1,500" → 150 / 1500
const parsePrice = (value) => {
  const match = String(value || "").replace(/,/g, "").match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const absolute = (siteUrl, url) => (url && url.startsWith("/") ? `${siteUrl}${url}` : url);

const buildOffers = (pricingSection, pageUrl) => {
  const offers = [];
  for (const plan of pricingSection?.plans || []) {
    const price = parsePrice(plan.price);
    const isFrom = /from/i.test(plan.price || "");
    const perMonth = /month/i.test(plan.priceNote || "");
    const service = {
      "@type": "Service",
      name: plan.title,
      serviceType: "Running coaching",
      ...(plan.description && { description: plan.description }),
    };

    // Two-column price tables (e.g. Half Marathon $150 / Marathon $250) → one offer per row
    const rows = plan.table?.columns?.length === 2 ? plan.table.rows || [] : [];
    const rowOffers = rows
      .map((row) => ({ label: row.cells?.[0], price: parsePrice(row.cells?.[1]) }))
      .filter((r) => r.label && r.price != null);

    if (rowOffers.length) {
      for (const row of rowOffers) {
        offers.push({
          "@type": "Offer",
          name: `${plan.title} – ${row.label}`,
          price: row.price,
          priceCurrency: "USD",
          url: `${pageUrl}#pricing`,
          itemOffered: { ...service, name: `${plan.title} – ${row.label}` },
        });
      }
      continue;
    }

    const offer = {
      "@type": "Offer",
      name: plan.title,
      priceCurrency: "USD",
      url: `${pageUrl}#pricing`,
      itemOffered: service,
    };
    if (price != null) {
      if (perMonth) {
        offer.priceSpecification = {
          "@type": "UnitPriceSpecification",
          price,
          priceCurrency: "USD",
          unitText: "month",
        };
      } else if (isFrom) {
        offer.priceSpecification = { "@type": "PriceSpecification", minPrice: price, priceCurrency: "USD" };
      } else {
        offer.price = price;
      }
    }
    offers.push(offer);
  }
  return offers;
};

export const buildStructuredData = ({ page, navigation, siteUrl }) => {
  if (!page || !siteUrl) return null;
  const pageUrl = `${siteUrl}/`;
  const sections = page.mainContent || [];
  const hero = sections.find((s) => s.pageComponent === "hero");
  const pricing = sections.find((s) => s.pageComponent === "pricing");
  const photo = absolute(siteUrl, hero?.componentImage?.asset?.url);
  const email = navigation?.footerEmail;

  const businessId = `${pageUrl}#business`;
  const coachId = `${pageUrl}#coach`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${pageUrl}#website`,
        name: BUSINESS.name,
        url: pageUrl,
      },
      {
        "@type": "ProfessionalService",
        "@id": businessId,
        name: BUSINESS.name,
        url: pageUrl,
        description: page.seo?.description,
        logo: `${siteUrl}/icon-512.png`,
        ...(photo && { image: photo }),
        ...(email && { email }),
        areaServed: BUSINESS.areaServed,
        knowsAbout: BUSINESS.knowsAbout,
        founder: { "@id": coachId },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Running coaching services",
          itemListElement: buildOffers(pricing, pageUrl),
        },
      },
      {
        "@type": "Person",
        "@id": coachId,
        name: BUSINESS.coachName,
        jobTitle: BUSINESS.jobTitle,
        ...(photo && { image: photo }),
        ...(email && { email }),
        worksFor: { "@id": businessId },
        hasCredential: {
          "@type": "EducationalOccupationalCredential",
          name: BUSINESS.credential.name,
          credentialCategory: "certification",
          recognizedBy: {
            "@type": "Organization",
            name: BUSINESS.credential.issuer,
            url: BUSINESS.credential.issuerUrl,
          },
        },
        memberOf: { "@type": "SportsClub", name: BUSINESS.club.name, url: BUSINESS.club.url },
      },
    ],
  };
};

export default buildStructuredData;
