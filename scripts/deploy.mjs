import { ethers } from "hardhat";

export async function deployToken(name, symbol, initialSupply) {
    try {
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);

        // MemeCoin 컨트랙트 배포
        const MemeCoin = await ethers.getContractFactory("MemeCoin");
        const token = await MemeCoin.deploy(name, symbol, initialSupply);
        await token.deploymentTransaction().wait();
        const tokenAddress = await token.getAddress();
        console.log("MemeCoin deployed to:", tokenAddress);

        // LiquidityPool 컨트랙트 배포
        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
        const pool = await LiquidityPool.deploy(tokenAddress);
        await pool.deploymentTransaction().wait();
        const poolAddress = await pool.getAddress();
        console.log("LiquidityPool deployed to:", poolAddress);

        return { tokenAddress, poolAddress };
    } catch (error) {
        console.error("Deployment error:", error);
        throw error;
    }
}
