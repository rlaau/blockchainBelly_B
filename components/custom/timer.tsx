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

  useEffect(() => {
    async function fetchTimer() {
      try {
        const response = await fetch("/api/timer", { cache: "no-store" });
        const data = await response.json();

        // 남은 시간이 "00:00:00"이면 waiting 상태로 처리
        const waiting = data.remainingTime === "00:00:00";
        setIsWaiting(waiting);
        setTimer(data);
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

  return (
    <div className="bg-gray-100 text-gray-900 p-2 rounded mb-4">
      <p>
        Remaining Time:{" "}
        {isWaiting ? <span className="text-red-500">Waiting</span> : timer.remainingTime}
      </p>
      <p>Total Time: {timer.totalTime}</p>
    </div>
  );
}
