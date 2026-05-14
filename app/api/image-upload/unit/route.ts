import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

// ✅ S3 → R2 변경 (endpoint 추가, NEXT_PUBLIC_ 제거)
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'User is not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    const uploadedUrls: string[] = [];

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 날짜 기반 파일명 생성
      const date = new Date();
      const timestamp = date.toISOString().replace(/[:\-T.]/g, '');
      const fileName = `${timestamp}_${file.name}`;

      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `${userId}/${fileName}`,
        Body: buffer,
        ContentType: file.type,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // ✅ R2 퍼블릭 URL 사용
      const url = `${process.env.R2_PUBLIC_URL}/${uploadParams.Key}`;
      uploadedUrls.push(url);
    });

    await Promise.all(uploadPromises);

    return NextResponse.json({ uploadedUrls }, { status: 200 });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}