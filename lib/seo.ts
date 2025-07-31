import { Metadata } from 'next'

export const siteConfig = {
  name: 'UpDrafted',
  description: 'The premier platform connecting student-athletes with D1, D2, D3, and JUCO college programs. Streamline your recruitment process with verified profiles, advanced search, and direct connections.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://updrafted.us',
  ogImage: '/og-image.png',
  creator: 'UpDrafted Team',
  twitterCreator: '@updraftedapp',
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
    'recruiting database',
    'NCAA recruiting',
    'college recruiting platform',
    'athletic recruiting',
    'sports scholarships'
  ],
}

export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icons/icon-512x512.png`,
  sameAs: [
    // Add your social media URLs here when available
    // 'https://twitter.com/updraftedapp',
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
    metadataBase: new URL(siteConfig.url),
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
      creator: siteConfig.twitterCreator, 
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon.png', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon.png', type: 'image/png' },
      ],
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

// Helper for generating page-specific metadata
export const pageMetadata = {
  home: () => generateMetadata({
    title: 'Connect Student-Athletes with College Programs',
    description: 'The premier platform for college athletic recruitment. Connect with D1, D2, D3, and JUCO programs. Build your profile, get discovered, and accelerate your college sports career.',
  }),
  
  search: () => generateMetadata({
    title: 'Search Athletes & Programs',
    description: 'Search and discover student-athletes and college programs. Advanced filters for sports, positions, academics, and more.',
    path: '/search',
  }),
  
  profile: (name?: string) => generateMetadata({
    title: name ? `${name}'s Profile` : 'Athlete Profile',
    description: 'View athlete profile, stats, achievements, and recruitment information on UpDrafted.',
    path: '/profile',
  }),
  
  dashboard: () => generateMetadata({
    title: 'Dashboard',
    description: 'Manage your recruitment profile, view connections, and track your college recruitment progress.',
    path: '/dashboard',
    noIndex: true,
  }),
  
  pricing: () => generateMetadata({
    title: 'Pricing Plans',
    description: 'Choose the perfect plan for your college recruitment journey. Premium features for serious athletes and coaches.',
    path: '/pricing',
  }),
  
  forAthletes: () => generateMetadata({
    title: 'For Student-Athletes',
    description: 'Get recruited by college programs. Build your profile, showcase your talents, and connect with coaches.',
    path: '/for-athletes',
  }),
  
  forCoaches: () => generateMetadata({
    title: 'For College Coaches',
    description: 'Discover and recruit talented student-athletes. Advanced search tools and verified profiles.',
    path: '/for-coaches',
  }),
  
  forRecruiters: () => generateMetadata({
    title: 'For Recruiters',
    description: 'Professional recruiting tools for finding and connecting with top student-athletes.',
    path: '/for-recruiters',
  }),
} 