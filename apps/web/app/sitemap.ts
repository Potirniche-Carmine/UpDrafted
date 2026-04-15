import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://updrafted.us'
  
  // Static public pages that should be indexed
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/for-athletes', priority: 0.9, changeFrequency: 'weekly' as const }, 
    { path: '/for-coaches', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/for-recruiters', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' as const },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms-of-service', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  // Get current date for more accurate lastModified
  const now = new Date()
  const currentDate = now.toISOString()

  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency,
    priority,
  }))
} 