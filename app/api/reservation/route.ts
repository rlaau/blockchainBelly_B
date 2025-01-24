import { NextResponse } from "next/server";
import {connectDB} from "@/database"; // 본인 프로젝트 경로에 맞게 수정

export async function GET(request: Request) {
    try {
      // URL 파라미터에서 coinId를 가져온다고 가정
      const { searchParams } = new URL(request.url);
      const coinId = searchParams.get("coinId");
      if (!coinId) {
        return NextResponse.json(
          { message: "Missing coinId" },
          { status: 400 }
        );
      }
  
      const client = await connectDB;
      const db = client.db("postings");
  
      // coinId와 endTime이 안 지난 reservationPool 찾기
      // (만약 지난 풀도 보여주고 싶다면 조건에서 endTime 검사 제거)
      const activePool = await db.collection("reservationPool").findOne({
        coinId,
        endTime: { $gte: new Date() },
      });
  
      // 풀이 없으면 예약내역도 없다고 가정 => 빈 배열 반환
      if (!activePool) {
        return NextResponse.json([], { status: 200 });
      }
  
      // 해당 풀의 예약 주문들 조회 (최신순 정렬)
      const reservations = await db
        .collection("reservation")
        .find({ reservationPoolId: activePool._id })
        .sort({ createdAt: -1 })
        .toArray();
  
      return NextResponse.json(reservations, { status: 200 });
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return NextResponse.json(
        { message: "Server error" },
        { status: 500 }
      );
    }
  }
// reservationPool 찾거나 만들고, reservation 기록까지 하는 예시
export async function POST(request: Request) {
  try {
    // 1) 클라이언트에서 보낸 JSON 데이터 파싱
    const { walletAddress, tokenAmount, ethAmount, coinId } = await request.json();

    // 2) DB 연결
    const client = await connectDB;
    const db = client.db("postings");

    // 3) 현재 활성화된 reservationPool 찾기 (예: coinId와 endTime이 지나지 않은 풀)
    //    - 만약 이미 현재 코인에 대한 풀을 생성해놓았다면, 그것을 가져오고
    //    - 없다면 새로 생성 (remainTime = 0이 되었을 때 자동 생성할 수도 있음)
    //      - 여기서는 예시로 "coinId"를 기반으로 하나만 생성/찾는다고 가정
    let activePool = await db.collection("reservationPool").findOne({
      coinId,
      endTime: { $gte: new Date() }, // endTime이 아직 안 지난 풀
    });

    // 4) 없으면 풀 생성 (createTime = 지금, endTime = createTime + 6시간)
    if (!activePool) {
      const createTime = new Date();
      const endTime = new Date(createTime.getTime() + 6 * 60 * 60 * 1000); // 6시간 뒤

      const resultPool = await db.collection("reservationPool").insertOne({
        coinId,
        createTime,
        endTime,
        status: "active",
      });
      // 새로 생성된 풀 정보
      activePool = {
        _id: resultPool.insertedId,
        coinId,
        createTime,
        endTime,
        status: "active",
      };
    }

    // 5) reservation 생성
    const reservationDoc = {
      reservationPoolId: activePool._id,
      walletAddress,
      tokenAmount,
      ethAmount,
      createdAt: new Date(),
    };

    const resultReservation = await db
      .collection("reservation")
      .insertOne(reservationDoc);

    // 6) 성공 응답
    return NextResponse.json(
      {
        message: "Reservation created successfully",
        reservationId: resultReservation.insertedId,
        reservationPoolId: activePool._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return NextResponse.json(
      { message: "An error occurred while creating reservation" },
      { status: 500 }
    );
  }
}
