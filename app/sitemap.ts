import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://updrafted.us'
  
  // Static public pages that should be indexed
  const staticPages = [
    '',
    '/about',
    '/for-athletes', 
    '/for-coaches',
    '/for-recruiters',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
  ]

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 
                   path === '/contact' || path.includes('policy') || path.includes('terms') ? 'yearly' : 
                   'weekly' as const,
    priority: path === '' ? 1 : 
              path.includes('/for-') ? 0.9 :
              path === '/about' ? 0.8 :
              path === '/contact' ? 0.6 :
              0.3,
  }))
} 