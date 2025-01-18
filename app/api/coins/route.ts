// app/api/coins/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/database';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


// S3 Client 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY as string,
  },
});

// GET: 코인 목록 조회
export async function GET() {
  try {
    const client = await connectDB;
    const db = client.db('postings');
    const coins = await db.collection<Coin>('coins')
                          .find({})
                          .sort({ createdAt: -1 })
                          .toArray();
    return NextResponse.json(coins);
  } catch (error) {
    console.error('Error fetching coins:', error);
    return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 });
  }
}

// POST: 새 코인 생성 (이미지 S3 업로드)
export async function POST(req: Request) {
  try {
    // multipart/form-data 파싱
    const formData = await req.formData();

    // 파일(이미지)과 텍스트 필드 추출
    const file = formData.get('image') as File | null;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!file || !title || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1) S3 업로드
    const bucketName = process.env.S3_BUCKET_NAME as string;
    const fileName = `${Date.now()}-${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      })
    );

    // S3에 업로드된 이미지의 URL
    const imgUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // 2) DB에 코인 정보 저장
    const client = await connectDB;
    const db = client.db('postings');
    const newCoin: Coin = {
      title,
      content,
      imgUrl,
      createdAt: new Date(),
    };

    const result = await db.collection<Coin>('coins').insertOne(newCoin);

    return NextResponse.json({
      message: 'Coin created successfully',
      coinId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating coin:', error);
    return NextResponse.json({ error: 'Failed to create coin' }, { status: 500 });
  }
}
