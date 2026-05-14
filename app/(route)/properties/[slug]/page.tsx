import { Metadata } from "next";
import { Suspense } from "react";
import { getUnitDetail } from "@/app/(route)/unit/action";
import DetailWrap from "@/app/(route)/unit/components/detail-wrap";
import { generatePropertySlug, extractIdFromSlug } from "@/lib/utils";

export interface UnitDetailProps {
  params: { slug: string };
}

// 濡쒕뵫 而댄룷?뚰듃
function PropertyLoading() {
  return (
    <div className="max-w-[1140px] mx-auto p-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// ?먮윭 而댄룷?뚰듃
function PropertyError({ message }: { message: string }) {
  return (
    <div className="max-w-[1140px] mx-auto p-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎
        </h2>
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  );
}

export async function generateMetadata(
  { params }: UnitDetailProps
): Promise<Metadata> {

  // ???щ윭洹몄뿉??ID 異붿텧
  const unitId = extractIdFromSlug(params.slug)
  const baseUrl = 'https://rbs-homes.com'

  if (!unitId) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
      alternates: {
        canonical: `${baseUrl}/properties/${params.slug}`,
      },
    }
  }

  try {
    const { unitDetail } = await getUnitDetail(unitId)

    if (!unitDetail) {
      return {
        title: 'Property Not Found',
        description: 'The requested property could not be found.',
        alternates: {
          canonical: `${baseUrl}/properties/${params.slug}`,
        },
      }
    }

    const title = unitDetail?.title || 'Property Details'
    const price = Number(unitDetail?.price || 0)
    const bed = Number(unitDetail?.bed || 0)
    const bath = Number(unitDetail?.bath || 0)
    const area = Number(unitDetail?.area || 0)
    const type = unitDetail?.type || ''
    const sellType = unitDetail?.sellType || ''

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(price)

    const fullAddress = [
      unitDetail?.addressSelf,
      unitDetail?.address3,
      unitDetail?.address2
    ].filter(addr => addr && addr.trim().length > 0).join(', ')

    const description = `${bed} bed, ${bath} bath ${type} ${sellType} in ${fullAddress}. ${formattedPrice}. Area: ${area}sqm`.trim()

    const images = Array.isArray(unitDetail.images)
      ? unitDetail.images
      : []
    const firstImageUrl = images[0] || '/assets/images/cities/BGC.png'

    const publishedTime = unitDetail?.regdate
      ? String(unitDetail.regdate)
      : new Date().toISOString()
    const modifiedTime = unitDetail?.lastUpdate
      ? String(unitDetail.lastUpdate)
      : new Date().toISOString()

    // ???щ윭洹??앹꽦
    const slug = generatePropertySlug({
      id: unitId,
      sellType: unitDetail.sellType,
      type: unitDetail.type,
      address2: unitDetail.address2,
      title: unitDetail.title,
    })

    return {
      title,
      description: description.length > 155
        ? description.substring(0, 155) + '...'
        : description,
      openGraph: {
        title,
        description,
        type: 'article',
        images: images.length > 0 ? [{ url: String(firstImageUrl) }] : [],
        publishedTime,
        modifiedTime,
        siteName: 'MR Homes Philippines',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: images.length > 0 ? [{ url: String(firstImageUrl) }] : [],
      },
      // ???щ윭洹?湲곕컲 canonical URL
      alternates: {
        canonical: `${baseUrl}/properties/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
      other: {
        'og:price:amount': price.toString(),
        'og:price:currency': 'PHP',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: title,
          description,
          image: images.length > 0 ? [firstImageUrl] : [],
          price: price.toString(),
          priceCurrency: 'PHP',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'PH',
            addressLocality: unitDetail?.address2 || '',
            streetAddress: unitDetail?.address3 || '',
          },
          numberOfBedrooms: bed,
          numberOfBathroomsTotal: bath,
          floorSize: {
            '@type': 'QuantitativeValue',
            value: area,
            unitCode: 'MTK',
          },
          datePosted: publishedTime,
          dateModified: modifiedTime,
        })
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Property Details',
      description: 'View property details on MR Homes Philippines'
    }
  }
}

const UnitDetail = async ({ params }: UnitDetailProps) => {
  // ???щ윭洹몄뿉??ID 異붿텧
  const unitId = extractIdFromSlug(params.slug)

  if (!unitId) {
    return <PropertyError message="?섎せ??留ㅻЪ ID?낅땲??" />
  }

  try {
    const { unitDetail } = await getUnitDetail(unitId)

    if (!unitDetail) {
      return <PropertyError message="?대떦 留ㅻЪ??李얠쓣 ???놁뒿?덈떎." />
    }

    return (
      <div className="max-w-[1140px] mx-auto">
        <Suspense fallback={<PropertyLoading />}>
          <DetailWrap property={unitDetail} unitId={unitId} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error fetching unit detail:', error)
    return (
      <PropertyError message="留ㅻЪ ?뺣낫瑜?遺덈윭?ㅻ뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎." />
    )
  }
}

export default UnitDetail