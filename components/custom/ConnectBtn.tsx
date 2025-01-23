"use client";

import { useState, useEffect } from "react";

export default function ConnectWalletButton() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 로컬스토리지에서 지갑 주소 불러오기
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  const connectWallet = async () => {
    // Metamask 설치 확인
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Metamask is not installed. Please install it to connect.");
      return;
    }

    if (!window.ethereum.request) {
      setError("Metamask's request method is unavailable.");
      return;
    }

    try {
      // Metamask 요청: 계정 연결
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // 연결된 첫 번째 계정 주소를 상태로 저장
      setWalletAddress(accounts[0]);
      localStorage.setItem("walletAddress", accounts[0]); // 로컬스토리지에 저장
      setError(null); // 에러 초기화
    } catch (err: any) {
      setError(err.message || "Failed to connect to Metamask.");
    }
  };

  const logout = () => {
    // 로그아웃: 상태와 로컬스토리지 초기화
    setWalletAddress(null);
    localStorage.removeItem("walletAddress");
    setError(null);
  };

  return (
    <div className="relative group">
      {walletAddress ? (
        <button
          onClick={logout}
          className="border-pink-600 border text-white px-4 py-2 rounded-md relative group"
        >
          Logout
          {/* Hover 시 지갑 주소 표시 */}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-black text-white text-sm rounded-md px-2 py-1 shadow-md">
            {walletAddress}
          </span>
        </button>
      ) : (
        <button
          onClick={connectWallet}
          className="border-pink-600 border text-white px-4 py-2 rounded-md"
        >
          Connect Wallet
        </button>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
