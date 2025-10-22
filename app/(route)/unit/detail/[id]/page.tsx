import { Metadata } from "next";
import { Suspense } from "react";
import { getUnitDetail } from "../../action";
import DetailWrap from "../../components/detail-wrap";

export interface UnitDetailProps {
 params: { id: string };
}

export async function generateMetadata({ params }: UnitDetailProps): Promise<Metadata> {
 const unitId = parseInt(params?.id);
const baseUrl = 'https://rbs-homes.com';
 if (!unitId || isNaN(unitId)) {
   return {
     title: 'Property Not Found',
     description: 'The requested property could not be found.',
      alternates: {
       canonical: `${baseUrl}/unit/detail/${params?.id || ''}`, 
     },
   };
 }

 try {
   const { unitDetail } = await getUnitDetail(unitId);

   // unitDetail이 없거나 필수 데이터가 없는 경우
   if (!unitDetail) {
     return {
       title: 'Property Not Found',
       description: 'The requested property could not be found.',
             alternates: {
       canonical: `${baseUrl}/unit/detail/${params?.id || ''}`, 
     },
     };
   }

   // 안전한 데이터 처리
   const title = unitDetail?.title || 'Property Details';
   const price = Number(unitDetail?.price || 0);
   const bed = Number(unitDetail?.bed || 0);
   const bath = Number(unitDetail?.bath || 0);
   const area = Number(unitDetail?.area || 0);
   const type = unitDetail?.type || '';
   const sellType = unitDetail?.sellType || '';

   const formattedPrice = new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'PHP',
     maximumFractionDigits: 0
   }).format(price);

   // 주소 조합 - 안전한 처리
   const fullAddress = [
     unitDetail?.addressSelf,
     unitDetail?.address3,
     unitDetail?.address2
   ].filter(addr => addr && addr.trim().length > 0).join(', ');

   const description = `${bed} bed, ${bath} bath ${type} ${sellType} in ${fullAddress}. ${formattedPrice}. Area: ${area}sqm`.trim();

   // 이미지 안전한 처리
   const images = Array.isArray(unitDetail.images) ? unitDetail.images : [];
   const firstImageUrl = images[0] || '/assets/images/cities/BGC.png';

   // 날짜 안전한 처리
   const publishedTime = unitDetail?.regdate ? String(unitDetail.regdate) : new Date().toISOString();
   const modifiedTime = unitDetail?.lastUpdate ? String(unitDetail.lastUpdate) : new Date().toISOString();

   return {
     title,
     description: description.length > 155 ? description.substring(0, 155) + '...' : description,
     openGraph: {
       title,
       description,
       type: 'article',
       images: [],
       publishedTime,
       modifiedTime,
       siteName: 'MR Homes Philippines',
       locale: 'en_US',
     },
     twitter: {
       card: 'summary_large_image',
       title,
       description,
       images: [],
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
   };
 } catch (error) {
   console.error('Error generating metadata:', error);
   return {
     title: 'Property Details',
     description: 'View property details on MR Homes Philippines'
   };
 }
}

// 로딩 컴포넌트
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

// 에러 컴포넌트
function PropertyError({ message }: { message: string }) {
 return (
   <div className="max-w-[1140px] mx-auto p-4">
     <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
       <h2 className="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
       <p className="text-red-600">{message}</p>
     </div>
   </div>
 );
}

const UnitDetail = async ({ params }: UnitDetailProps) => {
 const unitId = parseInt(params?.id);

 // ID 유효성 검사
 if (!unitId || isNaN(unitId)) {
   return <PropertyError message="잘못된 매물 ID입니다." />;
 }

 try {
   const { unitDetail } = await getUnitDetail(unitId);
   
   // unitDetail이 없을 경우 처리
   if (!unitDetail) {
     return <PropertyError message="해당 매물을 찾을 수 없습니다." />;
   }

   return (
     <div className="max-w-[1140px] mx-auto">
       <Suspense fallback={<PropertyLoading />}>
         <DetailWrap property={unitDetail} unitId={unitId} />
       </Suspense>
     </div>
   );
 } catch (error) {
   console.error('Error fetching unit detail:', error);
   return <PropertyError message="매물 정보를 불러오는 중 오류가 발생했습니다." />;
 }
};

export default UnitDetail;