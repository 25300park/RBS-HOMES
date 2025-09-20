import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rbs-homes.com'
  
  // 정적 페이지들
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
    // 매물 타입별 리스트 페이지
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
    // 매물 타입별 맵 페이지
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
    // 활성 매물들 조회
    const units = await prisma.unit.findMany({
      where: {
        status: {
          in: [0, 3] // 활성 상태 매물만
        }
      },
      select: { 
        id: true, 
        lastUpdate: true,
        regdate: true,
        sellType: true,
        type: true,
      },
      orderBy: {
        lastUpdate: 'desc' // 최근 업데이트된 순으로 정렬
      }
    })
    
    const unitUrls: MetadataRoute.Sitemap = units.map(unit => ({
      url: `${baseUrl}/unit/detail/${unit.id}`, 
      lastModified: unit.lastUpdate || unit.regdate || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9, 
    }))

    console.log(`📍 사이트맵 생성 완료:`)
    console.log(`   - 정적 페이지: ${staticUrls.length}개`)
    console.log(`   - 필터 페이지: ${filteredUrls.length}개`) 
    console.log(`   - 매물 페이지: ${unitUrls.length}개`)
    console.log(`   - 총 URL 수: ${staticUrls.length + filteredUrls.length + unitUrls.length}개`)

    return [...staticUrls, ...filteredUrls, ...unitUrls]

  } catch (error) {
    console.error('❌ 사이트맵 생성 중 오류:', error)
    
    return [...staticUrls, ...filteredUrls]
  }
}

export const revalidate = 3600