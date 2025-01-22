import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export interface DeployTokenBody {
    name: string;
    symbol: string;
    initialSupply: number;
}

export interface GenToken {
    tokenAddress: string;
    poolAddress: string;
}

export async function deployToken(tokenBody: DeployTokenBody): Promise<GenToken> {
    // 입력값 검증
    if (!tokenBody.name || !tokenBody.symbol || !tokenBody.initialSupply || tokenBody.initialSupply <= 0) {
        return { tokenAddress: "", poolAddress: "" };
    }

    // 환경 변수 파일 경로
    const envFilePath = path.resolve(process.cwd(), ".env.local");

    // 기존 .env.local 내용을 정확히 파싱
    const existingEnv: Record<string, string> = {};
    if (fs.existsSync(envFilePath)) {
        const envContent = fs.readFileSync(envFilePath, "utf8");
        envContent.split("\n").forEach((line) => {
            const match = line.match(/^\s*([^=]+)\s*=\s*(.+)?\s*$/); // key=value 형식 파싱
            if (match) {
                const key = match[1].trim();
                const value = match[2]?.trim() || "";
                existingEnv[key] = value;
            }
        });
    }

    // 새로운 환경 변수 추가 또는 기존 값 업데이트
    const updatedEnv = {
        ...existingEnv,
        TOKEN_NAME: tokenBody.name,
        TOKEN_SYMBOL: tokenBody.symbol,
        INITIAL_SUPPLY: tokenBody.initialSupply.toString(),
    };

    // .env.local 파일에 다시 쓰기 (기존 순서를 유지하려면 기존 내용을 기반으로 갱신)
    const newEnvContent = Object.entries(updatedEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    fs.writeFileSync(envFilePath, newEnvContent, { encoding: "utf8" });

    // Hardhat 명령어 실행
    const deployScript = path.resolve(process.cwd(), "scripts", "deploy.js");
    const args = ["run", deployScript, "--network", "localhost"];

    return new Promise((resolve, reject) => {
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
                try {
                    // JSON 파싱을 통해 반환된 값 추출
                    const parsedOutput = JSON.parse(output.trim());
                    resolve({
                        tokenAddress: parsedOutput.tokenAddress || "",
                        poolAddress: parsedOutput.poolAddress || "",
                    });
                } catch (parseError) {
                    console.error("JSON parse error:", parseError);
                    reject(new Error("Failed to parse deployment script output"));
                }
            } else {
                console.error("Deployment script failed:", errorOutput);
                reject(new Error(`Deployment script failed with error: ${errorOutput}`));
            }
        });
    });
}
