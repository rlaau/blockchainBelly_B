import { NextResponse } from "next/server";
import { deployToken } from "@/scripts/deploy.mjs";

interface DeployTokenBody {
  name: string;
  symbol: string;
  initialSupply: number;
}

export async function POST(request: Request) {
  try {
    const body: DeployTokenBody = await request.json();

    // 입력값 검증
    if (!body.name || !body.symbol || !body.initialSupply || body.initialSupply <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 배포 로직 호출
    const { tokenAddress, poolAddress } = await deployToken(
      body.name,
      body.symbol,
      body.initialSupply
    );

    // 결과 반환
    return NextResponse.json({
      message: "Token and LiquidityPool deployed successfully",
      token: {
        address: tokenAddress,
        name: body.name,
        symbol: body.symbol,
        initialSupply: body.initialSupply,
      },
      liquidityPool: {
        address: poolAddress,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to deploy token" }, { status: 500 });
  }
}
