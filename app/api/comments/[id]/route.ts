import { NextResponse } from 'next/server';
import { connectDB } from '@/database';
import { ObjectId } from 'mongodb';


export async function GET(request: Request, context: { params: { id: string } }) {
    const { params } = context; // context에서 params를 비동기적으로 가져옴
    const id = params.id; // await가 필요하지 않음, 바로 사용 가능

    if (!id) {
        return NextResponse.json({ error: 'Coin ID is required' }, { status: 400 });
    }

    try {
        const db = (await connectDB).db('postings');
        const comments = await db
            .collection('comments')
            .find({ coinId: new ObjectId(id) })
            .toArray();

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'Coin ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text) {
        return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    const db = (await connectDB).db('postings');
    const newComment = {
        coinId: new ObjectId(id),
        text,
        createdAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(newComment);

    // `insertedId`를 사용하여 새로 추가된 댓글을 클라이언트로 반환
    const insertedComment = { ...newComment, _id: result.insertedId };
    return NextResponse.json(insertedComment, { status: 201 });
}
