import NextHead from "next/head";

interface HeadProps {
  children?: React.ReactNode;
  pageTitle: string;
  description?: string;
  url?: string;
  image?: string | null;
  video?: string | null;
  ogType?: "article" | "website" | "post";
  twitterCard?: "summary_large_image";
}

function Head({
  children,
  pageTitle,
  description = "Easily share images and videos with others",
  url,
  image,
  video,
  ogType,
  twitterCard,
}: HeadProps) {
  const siteTitle = pageTitle ? `${pageTitle} | Share Me` : "Share Me";

  return (
    <NextHead>
      <title>{siteTitle}</title>
      <meta property="og:title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="twitter:image" content={image} />
        </>
      )}
      {video && <meta property="og:video" content={video} />}
      {twitterCard && <meta property="twitter:card" content={twitterCard} />}
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      {children}
    </NextHead>
  );
}

export default Head;
