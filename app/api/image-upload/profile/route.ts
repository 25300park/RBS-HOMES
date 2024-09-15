import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // next-auth에서 세션 가져오기


const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: Request) {
  try {
    // 세션에서 유저 정보 가져오기
    const session = await getServerSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'User is not authenticated' }, { status: 401 });
    }

    const userId = session.user.id; // 세션에서 유저 ID 가져오기

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 파일 이름 생성 (유저 ID 기반)
    const fileName = `profile_${userId}_${file.name}`;

    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: `profile-images/${userId}/${fileName}`, // 유저 프로필 이미지 폴더
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);

    await s3Client.send(command);

    const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

    // 유저 프로필 업데이트 로직 추가 필요 (DB에 imageUrl 저장)
    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Error uploading profile image' }, { status: 500 });
  }
}
