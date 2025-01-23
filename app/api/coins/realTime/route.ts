// Global variables to maintain state
const keyWordQueue: string[] = []; // keyWord 큐
const keyWordCounts: Record<string, number> = {}; // keyWord-view 딕셔너리
const MAX_ENTRIES = 1000; // 큐 최대 길이

import { NextResponse } from 'next/server';

// POST: keyWord 추가 및 상태 업데이트
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keyWord } = body;

    if (!keyWord) {
      return NextResponse.json({ error: 'KeyWord is required' }, { status: 400 });
    }

    // 1. keyWord 큐에 추가
    keyWordQueue.push(keyWord);

    // 2. keyWord 카운트 갱신
    keyWordCounts[keyWord] = (keyWordCounts[keyWord] || 0) + 0.5;

    // 3. 큐 길이가 초과되면 오래된 keyWord 제거
    if (keyWordQueue.length > MAX_ENTRIES) {
      const removedKeyWord = keyWordQueue.shift();
      if (removedKeyWord) {
        keyWordCounts[removedKeyWord] -= 1;
        if (keyWordCounts[removedKeyWord] === 0) {
          delete keyWordCounts[removedKeyWord];
        }
      }
    }

    return NextResponse.json({ message: 'KeyWord added successfully' });
  } catch (error) {
    console.error('Error updating keyWord queue:', error);
    return NextResponse.json({ error: 'Failed to update keyWord queue' }, { status: 500 });
  }
}

// GET: 상위 10개의 keyWord 반환
export async function GET() {
  try {
    // keyWordCounts에서 상위 10개 추출
    const topKeyWords = Object.entries(keyWordCounts)
      .sort(([, a], [, b]) => b - a) // 조회수 내림차순 정렬
      .slice(0, 10) // 상위 10개 추출
      .map(([keyWord, count]) => ({ keyWord, count }));

    return NextResponse.json(topKeyWords);
  } catch (error) {
    console.error('Error fetching trending keyWords:', error);
    return NextResponse.json({ error: 'Failed to fetch trending keyWords' }, { status: 500 });
  }
}
