import type React from "react";
import { createSeoMetadata } from "./seo-metadata";

interface SEOProps {
  title?: string;
  description?: string;
  pathname?: string;
  children?: React.ReactNode;
  banner?: string;
}

export const SEO = (props: SEOProps) => {
  const { banner, title, description, pathname, children } = props;
  const seo = createSeoMetadata({ banner, title, description, pathname });

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.banner} />

      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.banner} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.banner} />

      <link rel="icon" type="image/svg+xml" href={seo.faviconSvgUrl} />
      <link rel="icon" type="image/png" href={seo.faviconPngUrl} />
      {children}
    </>
  );
};
