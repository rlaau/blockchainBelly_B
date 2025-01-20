import { NextResponse } from 'next/server';
import { connectDB } from '@/database';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sort = url.searchParams.get("sort") || "time";
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);

    const client = await connectDB;
    const db = client.db("postings");

    const sortField =
      sort === "popularity" ? "viewCount" :
      sort === "price" ? "price" : 
      "createdAt";

    const coins = await db
      .collection("coins")
      .find()
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
