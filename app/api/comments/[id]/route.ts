import { NextResponse } from "next/server";
import { connectDB } from "@/database";
import { ObjectId } from "mongodb";

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    // context.params를 비동기적으로 가져오기
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Coin ID is required" }, { status: 400 });
    }

    const db = (await connectDB).db("postings");
    const comments = await db
      .collection("comments")
      .find({ coinId: new ObjectId(id) })
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    // context.params를 비동기적으로 가져오기
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Coin ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { text, walletAddress } = body;

    if (!text) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    const db = (await connectDB).db("postings");
    const newComment = {
      coinId: new ObjectId(id),
      text,
      walletAddress,
      createdAt: new Date(),
    };

    const result = await db.collection("comments").insertOne(newComment);

    const insertedComment = { ...newComment, _id: result.insertedId };
    return NextResponse.json(insertedComment, { status: 201 });
  } catch (error) {
    console.error("Error saving comment:", error);
    return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
  }
}
