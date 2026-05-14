import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = new Date().toISOString().replace(/[:\-T.]/g, '')
    const extension = file.name.split('.').pop()
    const fileName = `profile_${userId}_${timestamp}.${extension}`

    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `profile-images/${userId}/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // ✅ R2 퍼블릭 URL 사용
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${uploadParams.Key}`;

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Error uploading profile image" },
      { status: 500 }
    );
  }
}