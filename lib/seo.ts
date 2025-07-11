import { Metadata } from 'next'

export const siteConfig = {
  name: 'UpDrafted',
  description: 'The premier platform connecting student-athletes with D1, D2, D3, and JUCO college programs. Streamline your recruitment process with verified profiles, advanced search, and direct connections.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://updrafted.us',
  ogImage: '/og-image.png',
  creator: 'UpDrafted Team',
  keywords: [
    'college recruitment',
    'student athletes',
    'D1 recruiting',
    'D2 recruiting', 
    'D3 recruiting',
    'JUCO recruiting',
    'college sports',
    'athletic scholarships',
    'college coaches',
    'sports recruiting platform',
    'student athlete profiles',
    'college athletic programs',
    'sports recruitment',
    'college athletics',
    'recruiting database'
  ],
}

export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  sameAs: [
    // Add your social media URLs here when available
    // 'https://twitter.com/updrafted',
    // 'https://linkedin.com/company/updrafted',
    // 'https://instagram.com/updrafted'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    url: `${siteConfig.url}/contact`,
    availableLanguage: 'English'
  },
  offers: {
    '@type': 'Offer',
    category: 'Sports Recruitment Services',
    description: 'College athletic recruitment platform services'
  }
}

export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
}

export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
  path = '',
}: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
  path?: string
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const metaDescription = description || siteConfig.description
  const metaImage = image || siteConfig.ogImage
  const url = `${siteConfig.url}${path}`

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@updraftedapp', 
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  }
}

export const structuredDataScript = `
  ${JSON.stringify(organizationStructuredData)},
  ${JSON.stringify(websiteStructuredData)}
`

// Helper for private pages that should not be indexed
export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
} 