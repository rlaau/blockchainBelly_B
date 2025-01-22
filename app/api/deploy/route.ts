import { NextResponse } from "next/server";
// import { deployToken } from "./deployToken"; // deployToken 함수가 있는 파일을 import
// import type { DeployTokenBody } from "./deployToken"; // DeployTokenBody 타입 import
import { deployToken } from "../createAiCoin/deploy";
import type {DeployTokenBody} from "../createAiCoin/deploy";
export async function POST(request: Request) {
    try {
        // 요청 본문 파싱
        const body: DeployTokenBody = await request.json();

        // deployToken 호출 및 결과 받기
        const result = await deployToken(body);

        // 결과 리턴
        return NextResponse.json({
            message: "Token deployment successful",
            tokenAddress: result.tokenAddress,
            poolAddress: result.poolAddress,
        });
    } catch (error) {
        // 에러 처리
        console.error("Error during token deployment:", error);

        return NextResponse.json(
            {
                error: "Failed to deploy token",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
