    const { ethers } = require("hardhat");


    async function deployToken() {
        const [deployer] = await ethers.getSigners();
        const name =process.env.TOKEN_NAME
        const symbol= process.env.TOKEN_SYMBOL
       const initialSupply= process.env.INITIAL_SUPPLY
        const MemeCoin = await ethers.getContractFactory("MemeCoin");
        const token = await MemeCoin.deploy(name, symbol, initialSupply);
        await token.deploymentTransaction().wait();
        const tokenAddress = await token.getAddress();

        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
        const pool = await LiquidityPool.deploy(tokenAddress);
        await pool.deploymentTransaction().wait();
        const poolAddress = await pool.getAddress();
        const tokenName = await token.name();
        return { tokenAddress, poolAddress, tokenName };
    }
    if (require.main === module) {
        const args = process.argv.slice(2);
        const [name, symbol, initialSupply] = args;

        deployToken(name, symbol, parseInt(initialSupply))
            .then((result) => {
                console.log(JSON.stringify(result)); // JSON 형식으로 출력
                process.exit(0);
            })
            .catch((error) => {
                console.error(JSON.stringify({ error: error.message })); // JSON 형식으로 에러 출력
                process.exit(1);
            });
    }

    module.exports = { deployToken };
