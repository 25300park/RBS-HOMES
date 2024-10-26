// import prisma from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

// export async function getMainList(
//   page: number,
//   limit: number,
//   searchParams: Record<string, string>
// ) {
//   const type = searchParams.type !== "none" ? searchParams.type : undefined;
//   const sellType = searchParams.sellType !== "none" ? searchParams.sellType : undefined;
//   const bed = searchParams.bed ? parseInt(searchParams.bed) : undefined;
//   const bath = searchParams.bath ? parseInt(searchParams.bath) : undefined;
//   const parking = searchParams.parking ? parseInt(searchParams.parking) : undefined;
//   const city = searchParams.city !== "All Cities" ? searchParams.city : undefined;
//   const priceMin = searchParams.priceMin ? parseFloat(searchParams.priceMin) : undefined;
//   const priceMax = searchParams.priceMax ? parseFloat(searchParams.priceMax) : undefined;
//   const areaMin = searchParams.areaMin ? parseFloat(searchParams.areaMin) : undefined;
//   const areaMax = searchParams.areaMax ? parseFloat(searchParams.areaMax) : undefined;
//   const furniture = searchParams.furniture !== "none" ? searchParams.furniture : undefined;
//   const pet = searchParams.pet !== "none" ? searchParams.pet : undefined;
//   const search = searchParams.search || undefined;
//   const amenity = searchParams.amenity ? searchParams.amenity.split(",") : [];

//   // 가격 필터 처리
//   const priceFilter = priceMin !== undefined || priceMax !== undefined
//     ? {
//         price: {
//           gte: priceMin || undefined,
//           lte: priceMax || undefined,
//         },
//       }
//     : undefined;

//   // 검색 필터 처리
//   const searchFilter = search
//     ? {
//         OR: [
//           { title: { contains: search } },
//           { address3: { contains: search } },
//         ],
//       }
//     : undefined;

//   // 어메니티 필터 처리 (모든 어메니티가 포함된 경우만 필터링)
//   const amenityFilter = amenity.length > 0
//   ? {
//       amenity: {
//         array_contains: amenity, // JSON 필드에 주어진 모든 어메니티가 포함된 경우 필터링
//       },
//     }
//   : undefined;
//   // 전체 필터 조건 설정
//   const filterConditions  = {
//     type: type ? { equals: type } : undefined,
//     sellType: sellType ? { equals: sellType } : undefined,
//     bed: bed ? { gte: bed } : undefined,
//     bath: bath ? { gte: bath } : undefined,
//     parking: parking ? { gte: parking } : undefined,
//     address2: city ? { equals: city } : undefined,
//     area: areaMin !== undefined || areaMax !== undefined
//       ? { gte: areaMin || undefined, lte: areaMax || undefined }
//       : undefined,
//     furniture: furniture ? { equals: furniture } : undefined,
//     petPolicy: pet ? { equals: pet } : undefined,
//     // 어메니티 필터 추가
//     ...(amenityFilter && { ...amenityFilter }),
//     // 가격 필터가 존재할 경우 추가
//     ...(priceFilter && { ...priceFilter }),
//     // 검색 필터가 존재할 경우 추가
//     ...(searchFilter && { ...searchFilter }),
//   };
//   // 트랜잭션으로 findMany와 count 동시에 실행
//   const [units, totalUnits] = await prisma.$transaction([
//     prisma.unit.findMany({
//       skip: (page - 1) * limit,
//       take: limit,
//       where: filterConditions,
//       include: {
//         admin: true,
//       },
//     }),
//     prisma.unit.count({
//       where: filterConditions,
//     }),
//   ]);
//   console.log(totalUnits)
//   const transformedUnits = units.map(unit => ({
//     ...unit,
//     price: unit.price ? unit?.price?.toNumber() : unit.price,
//     outstandingPayment: unit.outstandingPayment 
//       ? unit?.outstandingPayment?.toNumber()
//       : unit.outstandingPayment,
//   }));

//   revalidatePath("/");  

//   return {
//     units: transformedUnits,
//     total: totalUnits,
//   };
// }
