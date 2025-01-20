import { NextResponse } from "next/server";
import { connectDB } from "@/database";

export async function GET(req: Request) {
  try {
    // URLSearchParams를 사용해 쿼리 매개변수만 파싱
    const queryParams = new URLSearchParams(req.url.split("?")[1]); // 쿼리 매개변수만 추출
    const field = queryParams.get("field");
    const value = queryParams.get("value");
    const num = parseInt(queryParams.get("num") || "10", 10);

    // 매개변수 유효성 검사
    if (!field || !value) {
      return NextResponse.json({ error: "Missing field or value" }, { status: 400 });
    }

    // 특수 문자 디코딩
    const decodedField = decodeURIComponent(field);
    const decodedValue = decodeURIComponent(value);

    // MongoDB 연결 및 쿼리 실행
    const client = await connectDB;
    const db = client.db("postings");

    const coins = await db
    .collection("coins")
    .aggregate([
      {
        $match: Array.isArray(decodedValue)
          ? {
              $expr: {
                $gt: [
                  { $size: { $setIntersection: [`$${decodedField}`, decodedValue] } },
                  0,
                ],
              },
            } // 배열인 경우 교집합 확인
          : {
              [decodedField]: decodedValue, // 단일 값인 경우 일치 비교
            },
      },
      { $limit: num },
    ])
    .toArray();
  

    return NextResponse.json(coins);
  } catch (error) {
    console.error("Failed to fetch similar coins 서버:", error);
    return NextResponse.json({ error: "서버가 db작업 실패함" }, { status: 500 });
  }
}
