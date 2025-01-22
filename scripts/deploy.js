const { ethers } = require("hardhat");

async function deployToken() {
    const [deployer] = await ethers.getSigners();
    const name = process.env.TOKEN_NAME;
    const symbol = process.env.TOKEN_SYMBOL;

    // 직접 단위를 맞춘 초기 공급량 (18자리 0 추가)
    const initialSupply = BigInt(process.env.INITIAL_SUPPLY || "0") * BigInt(10 ** 18);


    // MemeCoin 배포
    const MemeCoin = await ethers.getContractFactory("MemeCoin");
    const token = await MemeCoin.deploy(name, symbol, initialSupply, {
        gasPrice: BigInt(5 * 10 ** 9), // 5 Gwei를 BigInt로 계산
        gasLimit: 10000000, // 가스 한도 설정
    });
    await token.deploymentTransaction().wait();
    const tokenAddress = await token.getAddress();


    // LiquidityPool 배포
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const pool = await LiquidityPool.deploy(tokenAddress, {
        gasPrice: BigInt(5 * 10 ** 9), // 5 Gwei를 BigInt로 계산
        gasLimit: 10000000, // 가스 한도 설정
    });
    await pool.deploymentTransaction().wait();
    const poolAddress = await pool.getAddress();


    return { tokenAddress, poolAddress, tokenName: await token.name() };
}

if (require.main === module) {
    deployToken()
        .then((result) => {
            console.log(JSON.stringify(result));
            process.exit(0);
        })
        .catch((error) => {
            console.error(JSON.stringify({ error: error.message }));
            process.exit(1);
        });
}

module.exports = { deployToken };
