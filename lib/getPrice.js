import { ethers } from 'ethers';

export async function getPrice(poolAddress) {
    // 네트워크 설정
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);

    // LiquidityPool ABI
    const poolABI = [
        "function getPrice() public view returns (uint256)",
    ];

    // LiquidityPool 컨트랙트 인스턴스 생성
    const poolContract = new ethers.Contract(poolAddress, poolABI, provider);

    // getPrice 호출
    const price = await poolContract.getPrice();

    console.log("Price (1 ETH in Tokens):", ethers.formatUnits(price, 18));
    return ethers.formatUnits(price, 18); // 정규화된 토큰 가격
}

