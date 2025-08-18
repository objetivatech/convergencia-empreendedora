import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

export const SEOHead = ({
  title = "Mulheres em Convergência - Empoderando Mulheres Empreendedoras",
  description = "Plataforma que conecta, educa e impulsiona mulheres empreendedoras através de uma comunidade forte, recursos educacionais e oportunidades de negócio.",
  keywords = "mulheres empreendedoras, empreendedorismo feminino, negócios femininos, comunidade de mulheres, educação empresarial, networking feminino",
  image = "/hero-image.jpg",
  url = "https://mulheresemconvergencia.com.br/",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section
}: SEOHeadProps) => {
  const fullTitle = title.includes("Mulheres em Convergência") 
    ? title 
    : `${title} | Mulheres em Convergência`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mulheres em Convergência",
    "description": description,
    "url": url,
    "logo": `${url}logo-horizontal.png`,
    "sameAs": [
      "https://www.instagram.com/mulheresemconvergencia",
      "https://www.linkedin.com/company/mulheres-em-convergencia"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="pt_BR" />

      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};