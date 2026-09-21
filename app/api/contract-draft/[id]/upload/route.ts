import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { generateTemporaryPassword } from "@/lib/utils";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callerId = Number(session.user.id);
  const draftId = Number(params.id);

  const draft = await prisma.contractDraft.findUnique({
    where: { id: draftId },
    include: { unit: { select: { adminId: true } } },
  });
  if (!draft) {
    return NextResponse.json({ error: "Contract draft not found" }, { status: 404 });
  }

  if (draft.status !== "APPROVED") {
    return NextResponse.json(
      { error: "계약서가 승인 완료 상태여야 업로드 가능합니다" },
      { status: 400 }
    );
  }

  const isAuthorized =
    callerId === draft.landlordBrokerId ||
    callerId === draft.tenantBrokerId ||
    callerId === draft.unit.adminId;
  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const startDate = formData.get("startDate") as string | null;
  const endDate = formData.get("endDate") as string | null;
  const monthlyRent = formData.get("monthlyRent") as string | null;
  const tenantIdRaw = formData.get("tenantId") as string | null;
  const newTenantEmail = formData.get("newTenantEmail") as string | null;

  if (!file || !startDate || !endDate || !monthlyRent) {
    return NextResponse.json(
      { error: "file, startDate, endDate, and monthlyRent are required" },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "PDF 파일만 업로드 가능합니다" },
      { status: 400 }
    );
  }

  // ── Tenant 지정: 기존 회원(tenantId) 또는 신규 생성(newTenantEmail) ──
  let tenantId: number | null = tenantIdRaw ? Number(tenantIdRaw) : null;
  let newTenantCredentials: { email: string; tempPassword: string } | null = null;

  if (newTenantEmail) {
    const email = newTenantEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists, please select the existing account instead." },
        { status: 409 }
      );
    }

    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // level 미지정 → 스키마 기본값 1 적용 (signup과 동일)
      },
    });

    tenantId = newUser.id;
    newTenantCredentials = { email, tempPassword };
  }

  // R2 업로드
  const timestamp = new Date().toISOString().replace(/[:\-T.]/g, "");
  const key = `contracts/${draftId}/${timestamp}_${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: "application/pdf",
    })
  );

  const pdfUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  // 트랜잭션: LeaseContract 생성 → ContractUpload 생성 → draft FINALIZED → unit 숨김
  const [leaseContract] = await prisma.$transaction([
    prisma.leaseContract.create({
      data: {
        unitId: draft.unitId,
        landlordId: draft.unit.adminId,
        tenantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent: monthlyRent,
        status: "ACTIVE",
        createdById: callerId,
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.contractUpload.create({
      data: {
        unitId: draft.unitId,
        contractDraftId: draftId,
        pdfUrl,
        uploadedById: callerId,
        leaseContractId: leaseContract.id,
      },
    }),
    prisma.contractDraft.update({
      where: { id: draftId },
      data: { status: "FINALIZED" },
    }),
    prisma.unit.update({
      where: { id: draft.unitId },
      data: { status: 2 },
    }),
  ]);

  return NextResponse.json(
    {
      leaseContractId: leaseContract.id,
      pdfUrl,
      ...(newTenantCredentials ? { newTenant: newTenantCredentials } : {}),
    },
    { status: 201 }
  );
}
