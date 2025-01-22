const fs = require("fs");
const path = require("path");
require("@nomicfoundation/hardhat-toolbox");

// 환경 변수 로드
const envPath = path.resolve(__dirname, ".env.local");
const envVariables = fs.readFileSync(envPath, "utf8").split("\n");

envVariables.forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const { ethers } = require("ethers"); // ethers를 명시적으로 가져오기
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.20",
            },
            {
                version: "0.8.28",
            },
        ],
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        sepolia: {
            url: process.env.ALCHEMY_SEPOLIA_URL,      // Alchemy URL
            accounts: [process.env.PRIVATE_KEY],         // 개발 지갑 프라이빗 키
        }
    }
}