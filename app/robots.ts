// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account/', '/_next/static/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/account/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/account/'],
      },
      {
        userAgent: 'FacebookExternalHit',
        allow: '/',
      },
      {
        userAgent: 'Facebot',
        allow: '/',
      },
    ],
    sitemap: 'https://rbs-homes.com/sitemap.xml',
  }
}