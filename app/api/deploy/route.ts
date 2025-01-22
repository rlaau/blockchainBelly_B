import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

interface DeployTokenBody {
    name: string;
    symbol: string;
    initialSupply: number;
}

export async function POST(request: Request) {
    const body: DeployTokenBody = await request.json();

    // 입력값 검증
    if (!body.name || !body.symbol || !body.initialSupply || body.initialSupply <= 0) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 환경 변수 파일 경로
    const envFilePath = path.resolve(process.cwd(), ".env.local");

    // 기존 .env.local 내용을 읽어옴
    let existingEnv = {};
    if (fs.existsSync(envFilePath)) {
        const envContent = fs.readFileSync(envFilePath, "utf8");
        existingEnv = envContent.split("\n").reduce((acc, line) => {
            const [key, value] = line.split("=");
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {} as Record<string, string>);
    }

    // 새로운 환경 변수 추가 또는 기존 값 업데이트
    const updatedEnv = {
        ...existingEnv,
        TOKEN_NAME: body.name,
        TOKEN_SYMBOL: body.symbol,
        INITIAL_SUPPLY: body.initialSupply.toString(),
    };

    // .env.local 파일에 다시 쓰기
    const newEnvContent = Object.entries(updatedEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    fs.writeFileSync(envFilePath, newEnvContent, { encoding: "utf8" });

   

    // Hardhat 명령어 실행
    const deployScript = path.resolve(process.cwd(), "scripts", "deploy.js");
    const args = ["run", deployScript, "--network", "sepolia"];

    return new Promise((resolve) => {
        const child = spawn("npx", ["hardhat", ...args], { shell: true });

        let output = "";
        let errorOutput = "";

        child.stdout.on("data", (data) => {
            output += data.toString();
            console.log("STDOUT:", data.toString());
        });

        child.stderr.on("data", (data) => {
            errorOutput += data.toString();
            console.error("STDERR:", data.toString());
        });

        child.on("close", (code) => {
            console.log("Process exited with code:", code);
            if (code === 0) {
                resolve(
                    NextResponse.json({
                        message: "Deployment script executed successfully",
                        output,
                    })
                );
            } else {
                resolve(
                    NextResponse.json(
                        { error: "Deployment script failed", details: errorOutput },
                        { status: 500 }
                    )
                );
            }
        });
    });
}
