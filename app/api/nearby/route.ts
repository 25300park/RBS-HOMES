import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const radius = searchParams.get("radius") || "1000"; // 기본 반경 1km
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;

  if (!latitude || !longitude) {
    return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 });
  }

  const types = ["restaurant", "hospital", "pharmacy", "school", "park", "museum"];

  try {
    const fetchPromises = types.map((type) => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;
      return fetch(url).then((response) => response.json());
    });

    // 모든 요청이 완료될 때까지 기다림
    const results = await Promise.all(fetchPromises);

    const categorizedResults = types.reduce<Record<string, any[]>>((acc, type, index) => {
      acc[type] = results[index].results;
      return acc;
    }, {}); 

    return NextResponse.json(categorizedResults);
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    return NextResponse.json({ error: "Failed to fetch nearby places" }, { status: 500 });
  }
}
