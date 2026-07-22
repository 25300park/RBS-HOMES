export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getFilteredUnits, FilterParams } from "@/lib/units/get-filtered-units";

const DEFAULT_ACTIVE_TYPES = ["rent"];
const DEFAULT_STATUS = [0, 3];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const session: any = await getServerSession(authOptions as any);
    const userId = Number(session?.user?.id);

    const filters: FilterParams = {
      type: searchParams.get("type") || "none",
      sellType: searchParams.get("sellType") || "none",
      activeTypes: searchParams.get("activeTypes") || DEFAULT_ACTIVE_TYPES.join(","),
      bed: searchParams.get("bed") || "",
      bath: searchParams.get("bath") || "",
      parking: searchParams.get("parking") || "",
      city: searchParams.get("city") || "All Cities",
      priceMin: searchParams.get("priceMin") || "",
      priceMax: searchParams.get("priceMax") || "",
      areaMin: searchParams.get("areaMin") || "",
      areaMax: searchParams.get("areaMax") || "",
      furniture: searchParams.get("furniture") || "none",
      pet: searchParams.get("pet") || "none",
      search: searchParams.get("search") || "",
      amenities: searchParams.get("amenities") || "",
      sort: searchParams.get("sort") || "latest",
      status: searchParams.get("status") || DEFAULT_STATUS.join(","),
    };

    const { units, total } = await getFilteredUnits(page, limit, filters, userId);

    return NextResponse.json({ units, total });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
