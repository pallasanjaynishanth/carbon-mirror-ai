import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/avatar', '/reality', '/simulator', '/scanner', '/challenges', '/achievements', '/settings', '/api/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://carbonmirror.ai'}/sitemap.xml`,
  }
}
