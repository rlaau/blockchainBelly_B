import { NextResponse } from "next/server";
import { connectDB } from "@/database";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const keyWord = url.searchParams.get("keyWord");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10); // 기본 10개의 결과 제한

    if (!keyWord) {
      return NextResponse.json(
        { error: "keyWord query parameter is required" },
        { status: 400 }
      );
    }

    const client = await connectDB;
    const db = client.db("postings");

    const coins = await db
      .collection("coins")
      .find({ keyWord })
      .limit(limit)
      .toArray();

    if (coins.length === 0) {
      return NextResponse.json(
        { message: "No coins found with the given keyWord" },
        { status: 404 }
      );
    }

    return NextResponse.json(coins);
  } catch (error) {
    console.error("Error in GET /api/searchByKeyWord:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
