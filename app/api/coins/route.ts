// app/api/coins/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/database';



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
