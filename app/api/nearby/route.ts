import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const radius = searchParams.get("radius") || "1000"; // 기본 반경 1km
  const type = searchParams.get("type") || "restaurant"; // 기본으로 식당 조회
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;

  if (!latitude || !longitude) {
    return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 });
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    return NextResponse.json({ error: "Failed to fetch nearby places" }, { status: 500 });
  }
}
