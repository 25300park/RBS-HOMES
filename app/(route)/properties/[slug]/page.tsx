import { Metadata } from "next";
import { Suspense } from "react";
import { getUnitDetail } from "@/app/(route)/unit/action";
import DetailWrap from "@/app/(route)/unit/components/detail-wrap";
import { generatePropertySlug, extractIdFromSlug, parseImages } from "@/lib/utils";

export interface UnitDetailProps {
  params: { slug: string };
}

// 로딩 컴포넌트
function PropertyLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-zinc-200 rounded-xl w-2/3"></div>
        <div className="h-[420px] bg-zinc-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-32 bg-zinc-200 rounded-2xl"></div>
            <div className="h-48 bg-zinc-200 rounded-2xl"></div>
          </div>
          <div className="h-80 bg-zinc-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

// 에러 컴포넌트
function PropertyError({ message }: { message: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-black">
          !
        </div>
        <h2 className="text-xl font-black text-zinc-900">Property Not Found</h2>
        <p className="text-sm text-zinc-500">{message}</p>
      </div>
    </div>
  );
}

// AEO Direct Answer Spec Box — 답변엔진(LLM 검색/AI 요약)이 핵심 스펙을
// 바로 추출할 수 있도록 페이지 본문에 노출하는 요약 카드.
function SpecBox({
  formattedPrice,
  type,
  sellType,
  bed,
  bath,
  area,
  fullAddress,
}: {
  formattedPrice: string;
  type: string;
  sellType: string;
  bed: number;
  bath: number;
  area: number;
  fullAddress: string;
}) {
  const specs = [
    { label: "Price", value: formattedPrice },
    { label: "Property Type", value: type || "—" },
    { label: "Listing Type", value: sellType || "—" },
    { label: "Bedrooms", value: bed > 0 ? String(bed) : "—" },
    { label: "Bathrooms", value: bath > 0 ? String(bath) : "—" },
    { label: "Floor Area", value: area > 0 ? `${area} sqm` : "—" },
    { label: "Location", value: fullAddress || "—" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm">
      <h2 className="text-lg font-black text-zinc-900 mb-4">Property Specs at a Glance</h2>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {specs.map((spec) => (
          <div key={spec.label}>
            <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              {spec.label}
            </dt>
            <dd className="text-sm font-bold text-zinc-900 mt-0.5">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export async function generateMetadata(
  { params }: UnitDetailProps
): Promise<Metadata> {

  // 슬러그에서 ID 추출
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

    const images = parseImages(unitDetail.images);
    const firstImageUrl: string = String(images[0] || '/assets/images/cities/BGC.png')

    const publishedTime = unitDetail?.regdate
      ? String(unitDetail.regdate)
      : new Date().toISOString()
    const modifiedTime = unitDetail?.lastUpdate
      ? String(unitDetail.lastUpdate)
      : new Date().toISOString()

    return {
      title,
      description: description.length > 155 ? description.substring(0, 155) + '...' : description,
      openGraph: {
        title,
        description,
        type: 'article',
        images: [{ url: firstImageUrl, width: 1200, height: 630, alt: title }],
        publishedTime,
        modifiedTime,
        siteName: 'RBS Homes',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [firstImageUrl],
      },
      alternates: {
        canonical: `${baseUrl}/properties/${params.slug}`,
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
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Property Details',
      description: 'View property details on RBS Homes'
    }
  }
}

// JSON-LD 구조화 데이터 — Metadata.other가 아닌 실제 <script> 태그로 렌더링해야
// 크롤러/답변엔진이 인식함 (Next.js Metadata.other는 <meta> 태그로만 나감).
function buildJsonLd(unitDetail: any, slug: string) {
  const baseUrl = 'https://rbs-homes.com'
  const title = unitDetail?.title || 'Property Details'
  const price = Number(unitDetail?.price || 0)
  const bed = Number(unitDetail?.bed || 0)
  const bath = Number(unitDetail?.bath || 0)
  const area = Number(unitDetail?.area || 0)

  const fullAddress = [
    unitDetail?.addressSelf,
    unitDetail?.address3,
    unitDetail?.address2
  ].filter((addr) => addr && addr.trim().length > 0).join(', ')

  const images = parseImages(unitDetail.images)
  const firstImageUrl: string = String(images[0] || '/assets/images/cities/BGC.png')

  const publishedTime = unitDetail?.regdate
    ? String(unitDetail.regdate)
    : new Date().toISOString()
  const modifiedTime = unitDetail?.lastUpdate
    ? String(unitDetail.lastUpdate)
    : new Date().toISOString()

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description: `${bed} bed, ${bath} bath ${unitDetail?.type || ''} ${unitDetail?.sellType || ''} in ${fullAddress}`.trim(),
    url: `${baseUrl}/properties/${slug}`,
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
  }
}

const UnitDetail = async ({ params }: UnitDetailProps) => {
  // 슬러그에서 ID 추출
  const unitId = extractIdFromSlug(params.slug)

  if (!unitId) {
    return <PropertyError message="Invalid Property ID in URL." />
  }

  try {
    const { unitDetail } = await getUnitDetail(unitId)

    if (!unitDetail) {
      return <PropertyError message="The requested property listing could not be found or has been removed." />
    }

    const price = Number(unitDetail?.price || 0)
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(price)
    const fullAddress = [
      unitDetail?.addressSelf,
      unitDetail?.address3,
      unitDetail?.address2
    ].filter((addr) => addr && addr.trim().length > 0).join(', ')
    const jsonLd = buildJsonLd(unitDetail, params.slug)

    return (
      <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pt-3 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <SpecBox
            formattedPrice={formattedPrice}
            type={unitDetail?.type || ''}
            sellType={unitDetail?.sellType || ''}
            bed={Number(unitDetail?.bed || 0)}
            bath={Number(unitDetail?.bath || 0)}
            area={Number(unitDetail?.area || 0)}
            fullAddress={fullAddress}
          />
          <Suspense fallback={<PropertyLoading />}>
            <DetailWrap property={unitDetail} unitId={unitId} />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching unit detail:', error)
    return (
      <PropertyError message="An error occurred while loading the property details." />
    )
  }
}

export default UnitDetail