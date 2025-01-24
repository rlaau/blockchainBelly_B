
import { connectDB } from "@/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 가져오기 (안전 장치로 key 확인)
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    
    if (action !== "delete") {
      return NextResponse.json(
        { message: "Invalid action. Use 'action=delete' to delete documents." },
        { status: 400 }
      );
    }

    const client = await connectDB;
    const db = client.db("postings");

    // 삭제 조건
    const result = await db.collection("coins").deleteMany({
      imgUrl: { $regex: "images\\.unsplash\\.com", $options: "i" },
    });

    return NextResponse.json({
      message: `${result.deletedCount} documents deleted.`,
    });
  } catch (error) {
    console.error("Error deleting documents:", error);
    return NextResponse.json(
      { error: "Failed to delete documents." },
      { status: 500 }
    );
  }
}
