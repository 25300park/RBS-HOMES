import { getFilteredUnits } from "@/lib/units/get-filtered-units";
import { generatePropertySlug } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function searchUnitsForChat(params: {
  area?: string;
  type?: string;
  sellType?: string;
  priceMax?: string;
  bed?: string;
  keyword?: string;
}) {
  const filters = {
    type: params.type ?? "none",
    sellType: params.sellType ?? "none",
    activeTypes: "rent,sale",
    bed: params.bed ?? "",
    bath: "",
    parking: "",
    city: "All Cities",
    priceMin: "",
    priceMax: params.priceMax ?? "",
    areaMin: "",
    areaMax: "",
    furniture: "none",
    pet: "none",
    search: params.area ?? "",
    keyword: params.keyword,
    amenities: "",
    sort: "latest",
    status: "0,3",
  };

  try {
    const { units } = await getFilteredUnits(1, 8, filters, undefined);

    if (units.length === 0) {
      prisma.searchMissLog
        .create({
          data: {
            keyword: params.keyword ?? null,
            area: params.area ?? null,
            sellType: params.sellType ?? null,
            type: params.type ?? null,
          },
        })
        .catch(() => {});
    }

    return units.map((u) => ({
      id: u.id,
      title: u.title,
      price: u.price,
      bed: u.bed,
      bath: u.bath,
      area: u.area,
      type: u.type,
      sellType: u.sellType,
      url: `/properties/${generatePropertySlug(u)}`,
    }));
  } catch {
    return [];
  }
}
