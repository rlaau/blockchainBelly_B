"use client";
import { useEffect, useState } from "react";


interface TimerProps {
  onWaitingStatusChange: (waiting: boolean) => void;
}

export function Timer({ onWaitingStatusChange }: TimerProps) {
  const [timer, setTimer] = useState<TimerResponse>({
    remainingTime: "00:00:00",
    totalTime: "00:00:00",
  });
  
  // 타이머가 0초에 도달하면 "waiting" 상태로 전환
  const [isWaiting, setIsWaiting] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const fetchLatestCoin = async () => {
    try {
      const res = await fetch("/api/coins", { cache: "no-store" });
      const data = await res.json();
  
      if (Array.isArray(data) && data.length > 0) {
        // 최신 코인 하나 가져오기 (createdAt 기준 내림차순 정렬 후 첫 번째 아이템 선택)
        const latestCoin = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        setCoins([latestCoin]); // 최신 코인만 상태에 저장
      }
    } catch (error) {
      console.error("Failed to fetch latest coin:", error);
    }
  };
  useEffect(() => {
    fetchLatestCoin();
  }, [isWaiting]);
  useEffect(() => {
    async function fetchTimer() {
      try {
        const response = await fetch("/api/timer", { cache: "no-store" });
        const data = await response.json();

        // 남은 시간이 "00:00:00"이면 waiting 상태로 처리
        const waiting = data.remainingTime === "00:00:00";
        setIsWaiting(waiting);
        setTimer((prev) => ({
          ...prev,
          ...data, // 비동기로 가져온 데이터 병합
        }));
      } catch (error) {
        console.error("Failed to fetch timer:", error);
      }
    }

    // 초마다 타이머 정보 갱신
    fetchTimer();
    const intervalId = setInterval(fetchTimer, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // isWaiting이 바뀔 때마다 부모에게 알림
  useEffect(() => {
    onWaitingStatusChange(isWaiting);
  }, [isWaiting, onWaitingStatusChange]);
  // 남은 시간이 1분 이하면 빨간색으로 표시
  const isTimeCritical = () => {
    const [hours, minutes, seconds] = timer.remainingTime
      .split(":")
      .map((str) => parseInt(str, 10));
    return hours === 0 && minutes === 0 && seconds <= 60;
  };
  return (
<div
  className="-z-0 relative bg-gray-50 text-gray-200 p-12 text-centers flex flex-col items-center justify-center rounded mb-4 bg-cover bg-center"
  style={{
    backgroundImage: `url(${coins[0]?.imgUrl || "fallback-image-url"})`, // 안전한 접근 연산자와 기본값
  }}
>
  {/* 어두운 오버레이 */}
  <div className="absolute inset-0 bg-black/70"></div>

  {/* 콘텐츠 영역 */}
  <div className="relative z-10 text-center">
    <p
      className={`font-bold ${
        isWaiting || isTimeCritical() ? "text-red-500 text-4xl" : "text-3xl"
      }`}
    >
      {isWaiting ? (
        <span>Creating New Coin...</span>
      ) : (
        <span>
          Next coin in<br/>
          <span className="text-pink-600">{timer.remainingTime}</span>
        </span>
      )}
    </p>
    <p className="text-gray-300">generating cycle: {timer.totalTime}</p>
  </div>
</div>


  );
}
