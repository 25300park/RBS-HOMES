import { NextResponse } from 'next/server';
import { getUnitsWithAdmin } from '@/app/(route)/unit/action';

export async function GET(req : Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const data = await getUnitsWithAdmin(page, limit);
  
  return NextResponse.json(data);
}
