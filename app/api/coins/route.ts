import { NextResponse } from 'next/server';
import { connectDB } from '@/database';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sort = url.searchParams.get("sort") || "time";
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);
    const recent = url.searchParams.get("recent") === "true"; // recent 쿼리 파라미터 확인

    const client = await connectDB;
    const db = client.db("postings");

    const sortField =
      sort === "popularity" ? "viewCount" :
      sort === "price" ? "price" : 
      "createdAt";

      const query:any = {};

    // recent=true가 포함된 경우, 최근 7일의 데이터만 필터링
    if (recent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // 7일 전 날짜 계산
      query.createdAt = { $gte: sevenDaysAgo }; // createdAt 필드가 7일 전 이후인 것만
    }

    const coins = await db
      .collection("coins")
      .find(query)
      .sort({ [sortField]: -1 }) // 정렬
      .skip(page * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json(coins);
  } catch (error) {
    console.error("Failed to fetch coins:", error);
    return NextResponse.json({ error: "Failed to fetch coins" }, { status: 500 });
  }
}
