import prisma from "@/lib/prisma";
import { generatePropertySlug } from "@/lib/utils";
import HomelandLandingView, { HomelandProperty } from "./components/homeland-landing-view";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
];

export default async function HomelandPage() {
  // 1. Fetch real units and statistics from RBS Prisma Database
  const [units, propertiesCount, clientsCount, condosCount] = await Promise.all([
    prisma.unit.findMany({
      where: {
        status: { in: [0, 1, 3] }, // Available or active listings
      },
      include: {
        condo: {
          select: {
            id: true,
            condoName: true,
            address: true,
          },
        },
      },
      orderBy: {
        lastUpdate: "desc",
      },
      take: 8, // 4 columns x 2 rows
    }),
    prisma.unit.count({ where: { status: { in: [0, 1, 3] } } }).catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.condoMaster.count().catch(() => 0),
  ]);

  // 2. Transform DB units into HomelandProperty format
  const initialProperties: HomelandProperty[] = units.map((u, idx) => {
    let imgUrl = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
    if (u.images) {
      if (Array.isArray(u.images) && u.images.length > 0 && typeof u.images[0] === "string") {
        imgUrl = u.images[0];
      } else if (typeof u.images === "string") {
        try {
          const parsed = JSON.parse(u.images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            imgUrl = parsed[0];
          }
        } catch {
          if (u.images.startsWith("http")) {
            imgUrl = u.images;
          }
        }
      }
    }

    const isRent = u.sellType?.toLowerCase() === "rent" || !u.sellType;
    const priceNum = Number(u.price || 0);
    const formattedPrice = priceNum > 0 ? `₱ ${priceNum.toLocaleString()}` : "Price upon request";

    return {
      id: u.id,
      slug: generatePropertySlug(u),
      title: u.title || `${u.condo?.condoName || "Luxury Unit"} - Unit ${u.floor || ""}F`,
      location: u.fullAddress || `${u.address2 || u.condo?.address || "BGC"}, Taguig, Metro Manila`,
      price: formattedPrice,
      period: isRent ? "/ Month" : "",
      sellType: isRent ? "rent" : "buy",
      tag: isRent ? "For Rent" : "For Sale",
      tagColor: isRent ? "bg-[#10b981] text-white" : "bg-[#1d4ed8] text-white",
      beds: u.bed ? Number(u.bed) : 1,
      baths: u.bath ? Number(u.bath) : 1,
      area: u.area ? `${u.area} sqm` : "45 sqm",
      imgUrl: imgUrl,
    };
  });

  return (
    <HomelandLandingView
      initialProperties={initialProperties}
      stats={{
        propertiesCount: propertiesCount,
        clientsCount: clientsCount,
        condosCount: condosCount,
      }}
    />
  );
}
