import { connectDB } from "@/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 가져오기
    const url = new URL(request.url);
    const sortParam = url.searchParams.get("sort") || "genCount"; // 기본값은 "genCount"

    // 분석 및 정렬 수행
    const analyzedDict = await analyzeCoins(sortParam);
    return NextResponse.json(analyzedDict);
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze coins" },
      { status: 500 }
    );
  }
}

async function analyzeCoins(sortParam: string) {
  const client = await connectDB;
  const db = client.db("postings");

  // 1. 최근 1주일(7일) 전 날짜 계산
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 2. 최근 1주일 간 생성된 coin들 가져오기
  const coins = await db
    .collection<Coin>("coins")
    .find({ createdAt: { $gte: sevenDaysAgo } })
    .toArray();

  // 3. 집계할 필드를 정의
  const fieldsToAnalyze = [
    "keyWord",
    "majorPeople",
    "field",
    "eventClassification",
    "region",
  ] as const;

  // 4. 결과를 저장할 객체 초기화
  const analysisResult: Record<string, Record<string, [number, number]>> = {};

  fieldsToAnalyze.forEach((field) => {
    analysisResult[field] = {};
  });

  // 5. coin들을 순회하며 각 필드에 대한 집계 수행
  for (const coin of coins) {
    for (const field of fieldsToAnalyze) {
      if (!coin[field]) continue;

      if (Array.isArray(coin[field])) {
        const fieldArray = coin[field] as string[];
        fieldArray.forEach((value) => {
          if (!analysisResult[field][value]) {
            analysisResult[field][value] = [0, 0];
          }
          analysisResult[field][value][0] += 1; // 등장 횟수 +1
          analysisResult[field][value][1] += coin.viewCount ?? 0; // viewCount 합산
        });
      } else {
        const value = coin[field] as string;
        if (!analysisResult[field][value]) {
          analysisResult[field][value] = [0, 0];
        }
        analysisResult[field][value][0] += 1;
        analysisResult[field][value][1] += coin.viewCount ?? 0;
      }
    }
  }

  // 6. 등장 횟수가 2회 이상인 것만 필터링
  const filteredResult: Record<string, Record<string, [number, number]>> = {};

  for (const field in analysisResult) {
    filteredResult[field] = Object.fromEntries(
      Object.entries(analysisResult[field]).filter(
        ([, [count]]) => count >= 2 // 등장 횟수 2회 이상
      )
    );
  }
// 7. 필터링된 결과를 정렬
const sortedResult: Record<string, [string, [number, number]][]> = {};

for (const field in filteredResult) {
  sortedResult[field] = Object.entries(filteredResult[field])
    .sort((a, b) => {
      if (sortParam === "viewCount") {
        return b[1][1] - a[1][1]; // viewCount 기준으로 내림차순
      } else if (sortParam === "genCount") {
        return b[1][0] - a[1][0]; // 등장 횟수(genCount) 기준으로 내림차순
      }
      return 0; // 정렬 기준이 없으면 그대로 유지
    })
    .slice(0, 10); // 상위 10개만 선택
}

  // 8. 결과 반환
  return sortedResult;
}
