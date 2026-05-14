import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'
import { generatePropertySlug } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rbs-homes.com'

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/list`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  const filteredUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/list?activeTypes=rent`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/list?activeTypes=sale`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/list?activeTypes=preSale`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/map?activeTypes=rent`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/map?activeTypes=sale`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/map?activeTypes=preSale`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  try {
    const units = await prisma.unit.findMany({
      where: {
        status: {
          in: [1]
        }
      },
      select: {
        id: true,
        lastUpdate: true,
        regdate: true,
        sellType: true,
        type: true,
        address2: true,
        title: true,
        images: true,
      },
      orderBy: {
        lastUpdate: 'desc'
      }
    })

    const unitUrls: MetadataRoute.Sitemap = units.map(unit => {
      const images = Array.isArray(unit.images)
        ? unit.images as string[]
        : (unit.images ? JSON.parse(unit.images as string) as string[] : []);

      return {
        url: `${baseUrl}/properties/${generatePropertySlug(unit)}`,
        lastModified: unit.lastUpdate || unit.regdate || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
        images: images.slice(0, 1).map((img: string) => ({
          url: img,
          title: unit.title || '',
        })),
      };
    })

    console.log(`sitemap 생성 완료:`)
    console.log(`   - 정적 페이지: ${staticUrls.length}개`)
    console.log(`   - 필터 페이지: ${filteredUrls.length}개`)
    console.log(`   - 매물 페이지: ${unitUrls.length}개`)
    console.log(`   - 총 URL 수: ${staticUrls.length + filteredUrls.length + unitUrls.length}개`)

    return [...staticUrls, ...filteredUrls, ...unitUrls]
  } catch (error) {
    console.error('sitemap 생성 오류:', error)
    return [...staticUrls, ...filteredUrls]
  }
}

export const revalidate = 3600
