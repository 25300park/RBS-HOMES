import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = [
    {
      url: 'https://rbs-homes.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rbs-homes.com/list',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rbs-homes.com/map',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rbs-homes.com/list?activeTypes=rent',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rbs-homes.com/list?activeTypes=sale',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rbs-homes.com/list?activeTypes=preSale',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rbs-homes.com/map?activeTypes=rent',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://rbs-homes.com/map?activeTypes=sale',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://rbs-homes.com/map?activeTypes=preSale',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://rbs-homes.com/policy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://rbs-homes.com/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const units = await prisma.unit.findMany({
    where: {
      status: {
        in: [0, 3]
      }
    },
    select: { 
      id: true, 
      lastUpdate: true 
    }
  })
  
  
  const unitUrls = units.map(unit => ({
    url: `https://rbs-homes.com/unit/${unit.id}`,
    lastModified: unit.lastUpdate || new Date(),
  }))
  
  return [...staticUrls, ...unitUrls]
}