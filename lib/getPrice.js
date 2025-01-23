import { ethers } from 'ethers';

export async function getPrice(poolAddress) {
    try {
        // 네트워크 설정
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);

        // LiquidityPool ABI
        const poolABI = ["function getPrice() public view returns (uint256)"];
        const poolContract = new ethers.Contract(poolAddress, poolABI, provider);

        // getPrice 호출
        const fetchedPrice = await poolContract.getPrice();

        // 반환값 검증
        if (!fetchedPrice || fetchedPrice.toString() === "0") {
            console.warn("ETH 잔액이 0이거나 유효한 가격이 없습니다.");
            return "0.0"; // 기본값 반환
        }

        console.log("Price (1 ETH in Tokens):", ethers.formatUnits(fetchedPrice, 18));
        return ethers.formatUnits(fetchedPrice, 18); // 정규화된 토큰 가격
    } catch  {
        console.error = () => {}; // 콘솔 출력 덮어쓰기
        return "0.0"; // 에러 발생 시 기본값 반환
    }
}
