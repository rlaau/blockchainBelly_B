"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CoinExternal } from "@/components/custom/coinExtenal";

// Timer 컴포넌트를 동적으로 가져옴 (SSR 비활성화)
const Timer = dynamic(() => import("@/components/custom/timer").then((mod) => mod.Timer), {
  ssr: false,
});


export default function GetCoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);

  // (1) Timer 컴포넌트가 전달하는 waiting 상태를 받는 콜백
  const handleWaitingStatusChange = (waiting: boolean) => {
    setIsWaiting(waiting);
  };

  // (2) 코인 목록 가져오기 함수
  const fetchCoins = async () => {
    try {
      const res = await fetch("/api/coins", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCoins(data);
      }
    } catch (error) {
      console.error("Failed to fetch coins:", error);
    }
  };

  // (3) 처음 마운트 시 한 번 불러오고, 'isWaiting' 상태가 바뀔 때마다 다시 가져옴
  useEffect(() => {
    fetchCoins();
  }, [isWaiting]);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div>
        {/* Timer 컴포넌트에서 waiting 상태 변화를 감지해 handleWaitingStatusChange에 전달 */}
        <Timer onWaitingStatusChange={handleWaitingStatusChange} />
      </div>

      <h1 className="text-2xl font-bold mb-4">Coin List</h1>
      <a
        href="/api/createAiCoin"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Create New Coin
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coins.map((coin) => (
          <CoinExternal key={String(coin._id) || "fallback"} coin={coin} />
        ))}
      </div>
    </main>
  );
}
