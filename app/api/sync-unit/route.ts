// rbs-homes.com/app/api/sync-unit/route.ts
// CRM에서 매물 정보를 받아 Unit 테이블에 동기화

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ── 필드 매핑 ──────────────────────────────────────────────────
const mapSellType = (t: string) => t === 'RENT' ? 'rent' : 'sale'
const mapType     = (t: string) => {
  const m: Record<string, string> = {
    CONDO: 'condo', OFFICE: 'etc', COMMERCIAL: 'etc',
    BUILDING: 'apartment', LAND: 'land', OTHER: 'etc'
  }
  return m[t] || 'condo'
}
const mapFurniture = (t: string | null) => {
  if (!t) return 'unfurnished'
  return t === 'full' ? 'fully' : t === 'semi' ? 'semi' : 'unfurnished'
}
const mapPet = (v: boolean | null) => {
  if (v === true)  return 'Allow'
  if (v === false) return 'Not allowed'
  return 'Not allowed'
}

// ── 인증 ───────────────────────────────────────────────────────
function validateAuth(req: NextRequest): boolean {
  const auth   = req.headers.get('authorization') || ''
  const secret = process.env.CRM_SYNC_SECRET || ''
  return auth === `Bearer ${secret}` && secret.length > 0
}

// ── POST: 매물 생성 또는 업데이트 ─────────────────────────────
export async function POST(req: NextRequest) {
  if (!validateAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      crm_listing_id,  // CRM측 UUID (idempotency용)
      title,
      transaction_type,
      property_type,
      address,
      unit_no,
      area_sqm,
      floor,
      bedrooms,
      bathrooms,
      parking,
      furnished_type,
      pet_friendly,
      price,
      remarks,
      photo_url,
      photos,
      rbs_unit_id,    // 기존에 동기화된 unit ID (update 시)
    } = body

    // images 배열 구성 (Supabase URL 그대로 사용)
    const imageArr = [
      ...(photo_url ? [photo_url] : []),
      ...(Array.isArray(photos) ? photos : [])
    ]
    const imagesJson = JSON.stringify(imageArr)

    // 주소 구성
    const fullAddr = [address, unit_no ? `Unit ${unit_no}` : null]
      .filter(Boolean).join(', ')

    // rbs-homes adminId — 환경변수로 관리 (CRM 전용 계정)
    const adminId = Number(process.env.CRM_ADMIN_ID || 1)

    const unitData = {
      adminId,
      title:       title || 'Untitled',
      type:        mapType(property_type || 'CONDO'),
      sellType:    mapSellType(transaction_type || 'RENT'),
      fullAddress: fullAddr || null,
      address3:    address  || null,
      address4:    unit_no  || null,
      addressSelf: address  || null,
      ownerName:   'MR. HOMES PHILIPPINES',
      area:        Math.round(area_sqm || 0),
      floor:       floor ? parseInt(floor) : null,
      bed:         bedrooms  != null ? bedrooms  : null,
      bath:        bathrooms != null ? bathrooms : null,
      parking:     parking   != null ? parking   : null,
      furniture:   mapFurniture(furnished_type),
      petPolicy:   mapPet(pet_friendly),
      price:       price ? price : null,
      note:        remarks || null,
      images:      imagesJson,
      status:      0,   // Ongoing (active)
      lastUpdate:  new Date(),
    }

    let unit

    if (rbs_unit_id) {
      // 기존 매물 업데이트
      unit = await prisma.unit.update({
        where: { id: rbs_unit_id },
        data:  unitData,
      })
    } else {
      // 신규 매물 생성
      unit = await prisma.unit.create({ data: unitData })
    }

    return NextResponse.json({
      success:     true,
      rbs_unit_id: unit.id,
      message:     rbs_unit_id ? 'Updated' : 'Created',
    })
  } catch (err: any) {
    console.error('[sync-unit] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── DELETE: 매물 비활성화 (unpublish) ─────────────────────────
export async function DELETE(req: NextRequest) {
  if (!validateAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rbs_unit_id } = await req.json()
    if (!rbs_unit_id) {
      return NextResponse.json({ error: 'rbs_unit_id required' }, { status: 400 })
    }

    // status 4 = Suspended (비활성화)
    await prisma.unit.update({
      where: { id: rbs_unit_id },
      data:  { status: 4, lastUpdate: new Date() }
    })

    return NextResponse.json({ success: true, message: 'Unpublished' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
