import { Metadata } from "next";
import { getUnitDetail } from "../../action";
import DetailWrap from "../../components/detail-wrap";
import { sleep } from "@/lib/utils";

export interface UnitDetailProps {
  params: { id: string };
}

export async function generateMetadata({ params }: UnitDetailProps): Promise<Metadata> {
  const unitId = parseInt(params?.id);
  
  if (!unitId || isNaN(unitId)) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.'
    };
  }

  try {
    const { unitDetail } = await getUnitDetail(unitId);

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(Number(unitDetail?.price || 0));

    // 주소 조합
    const fullAddress = [
      unitDetail?.addressSelf,
      unitDetail?.address3,
      unitDetail?.address2
    ].filter(Boolean).join(', ');

    const description = `${unitDetail?.bed || 0} bed, ${unitDetail?.bath || 0} bath ${unitDetail?.type} ${unitDetail?.sellType} in ${fullAddress}. ${formattedPrice}. Area: ${unitDetail?.area}sqm`;

    return {
      title: unitDetail?.title,
      description: description.substring(0, 155) + '...',
      openGraph: {
        title: unitDetail?.title,
        description: description,
        type: 'article',
        images: unitDetail?.images ? 
          [{ 
            url: (unitDetail?.images as any)[0]?.url || '/assets/images/cities/BGC.png',
            width: 1200,
            height: 630,
            alt: unitDetail?.title
          }] : [],
        publishedTime: String(unitDetail?.regdate) ,
        modifiedTime: String(unitDetail?.lastUpdate),
        siteName: 'MR Homes Philippines',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: unitDetail?.title,
        description: description,
        images: unitDetail?.images ? [(unitDetail?.images as any)[0]?.url || '/assets/images/cities/BGC.png'] : [],
      },
      alternates: {
        canonical: `https://rbs-homes/unit/detail/${unitId}`,
      },
      robots: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
      other: {
        'og:price:amount': unitDetail?.price?.toString() as string,
        'og:price:currency': 'PHP',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: unitDetail?.title,
          description: description,
          image: unitDetail?.images ? [(unitDetail?.images as any)[0]?.url] : [],
          price: unitDetail?.price?.toString(),
          priceCurrency: 'PHP',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'PH',
            addressLocality: unitDetail?.address2,
            streetAddress: unitDetail?.address3,
          },
          numberOfBedrooms: unitDetail?.bed,
          numberOfBathroomsTotal: unitDetail?.bath,
          floorSize: {
            '@type': 'QuantitativeValue',
            value: unitDetail?.area,
            unitCode: 'MTK', 
          },
          datePosted: unitDetail?.regdate,
          dateModified: unitDetail?.lastUpdate,
        })
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Property Details',
      description: 'View property details on MR Homes Philippines'
    };
  }
}

const UnitDetail = async ({ params }: UnitDetailProps) => {
  const unitId = parseInt(params?.id);

  if (!unitId || isNaN(unitId)) {
    return <p>Error: Invalid unit ID.</p>;
  }

  const { unitDetail } = await getUnitDetail(unitId);
  return (
    <div className="max-w-[1140px] mx-auto">
      <DetailWrap property={unitDetail} />
    </div>
  );
};

export default UnitDetail;