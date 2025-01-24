const { ethers } = require("hardhat");

async function deployToken() {
    const [deployer] = await ethers.getSigners();
    const name = process.env.TOKEN_NAME;
    const symbol = process.env.TOKEN_SYMBOL;

    const initialSupplyFloat = parseFloat(process.env.INITIAL_SUPPLY || "0");
    const initialSupply = BigInt(Math.floor(initialSupplyFloat * 1e18));

    // 가스 데이터 가져오기
    const feeData = await ethers.provider.getFeeData();
    const baseFeePerGas = feeData.gasPrice || BigInt(10 * 10 ** 9); // 기본 10 Gwei
    const maxFeePerGas = baseFeePerGas * 5n; // 기본 수수료의 5배
    const maxPriorityFeePerGas = BigInt(2 * 10 ** 9); // 2 Gwei

    // console.log("Base Fee Per Gas:", baseFeePerGas.toString());
    // console.log("Max Fee Per Gas:", maxFeePerGas.toString());
    // console.log("Max Priority Fee Per Gas:", maxPriorityFeePerGas.toString());

    // // MemeCoin 배포
    // console.log("Deploying MemeCoin...");
    const MemeCoin = await ethers.getContractFactory("MemeCoin");
    const token = await MemeCoin.deploy(name, symbol, initialSupply, {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit: 10000000,
    });
    await token.deploymentTransaction().wait();
    const tokenAddress = await token.getAddress();
    // console.log(`MemeCoin deployed at: ${tokenAddress}`);

    // // LiquidityPool 배포
    // console.log("Deploying LiquidityPool...");
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const pool = await LiquidityPool.deploy(tokenAddress, {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit: 10000000,
    });
    await pool.deploymentTransaction().wait();
    const poolAddress = await pool.getAddress();
    // console.log(`LiquidityPool deployed at: ${poolAddress}`);

    // 유동성 추가
    const tokenReservationRaw = process.env.TOKEN_RESERVATION || "0";
    const ethReservationRaw = process.env.ETH_RESERVATION || "0";

    const tokenFloat = parseFloat(tokenReservationRaw);
    const ethFloat = parseFloat(ethReservationRaw);

    const tokenReservation = BigInt(Math.floor(tokenFloat * 1e18));
    const ethReservation = BigInt(Math.floor(ethFloat * 1e18));

    // console.log("Token Reservation:", tokenReservation.toString());
    // console.log("ETH Reservation:", ethReservation.toString());

    if (tokenReservation > 0n && ethReservation > 0n) {
        try {
            //console.log("Adding liquidity to LiquidityPool...");
// Approve 호출 전에 상태 디버깅
//console.log("Approving tokens for LiquidityPool...");
await token.allowance(deployer.address, poolAddress);
//console.log("Allowance before approve:", allowanceBefore.toString());

// Approve 호출
const txApprove = await token.connect(deployer).approve(poolAddress, tokenReservation, {
    type: 2,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit: 10000000,
  });
  await txApprove.wait();
// Approve 호출 후 상태 확인
const allowanceAfter = await token.allowance(deployer.address, poolAddress);
//console.log("Allowance after approve:", allowanceAfter.toString());

// 유효성 검사
if (allowanceAfter < tokenReservation) {
    throw new Error("Approve failed to set the correct allowance.");
}

//console.log("Token approved.");
const txAddLiquidity = await pool.connect(deployer).addLiquidity(tokenReservation, {
    type: 2,
    value: ethReservation,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit: 10000000,
  });
            await txAddLiquidity.wait();
            // console.log("Transaction details:", txAddLiquidity);
            // console.log("Liquidity added.");
        } catch (error) {
            console.error("Error during addLiquidity transaction:");
            console.error("Transaction details:", {
                tokenReservation: tokenReservation.toString(),
                ethReservation: ethReservation.toString(),
                maxFeePerGas: maxFeePerGas.toString(),
                maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                gasLimit: 10000000,
            });
            console.error("Error message:", error.message);
        }
    } else {
       // console.log("No liquidity to add. Skipping liquidity addition.");
    }
    // console.log(JSON.stringify({
    //     tokenAddress,
    //     poolAddress,
    //     tokenName: name,
    // }));
    
  

    // 디버깅: Pool 상태 확인
const tokenBalance = await token.balanceOf(poolAddress);
const ethBalance = await ethers.provider.getBalance(poolAddress);
const rawPrice = (ethBalance * 10n ** 18n) / tokenBalance; // BigInt 정규화
const tokenPrice = (Number(rawPrice) / 10 ** 18).toFixed(6); // 소수점 6자리까지 표시

    // 최종 JSON 출력
    const result = {
      tokenAddress,
      poolAddress,
      tokenName: await token.name(),
      tokenSymbol: await token.symbol(),
      tokenPrice, // LiquidityPool의 가격 추가
    };
    console.log(JSON.stringify(result, null, 2));

    return result;

    return {
        tokenAddress,
        poolAddress,
        tokenName: await token.name(),
     
    };
}

if (require.main === module) {
    deployToken()
        .then(() => {
            //console.log("Deployment result:", JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch((error) => {
            console.error("Error during deployment:", error.message);
            process.exit(1);
        });
}

module.exports = { deployToken };
