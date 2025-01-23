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
  const [isWaiting, setIsWaiting] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

  const fetchLatestCoin = async () => {
    try {
      const res = await fetch("/api/coins", { cache: "no-store" });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const latestCoin = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setCoins([latestCoin]);
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

        const waiting = data.remainingTime === "00:00:00";
        setIsWaiting(waiting);
        setTimer((prev) => ({
          ...prev,
          ...data,
        }));
      } catch (error) {
        console.error("Failed to fetch timer:", error);
      }
    }

    fetchTimer();
    const intervalId = setInterval(fetchTimer, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    onWaitingStatusChange(isWaiting);
  }, [isWaiting, onWaitingStatusChange]);

  const isTimeCritical = () => {
    const [hours, minutes, seconds] = timer.remainingTime
      .split(":")
      .map((str) => parseInt(str, 10));
    return hours === 0 && minutes === 0 && seconds <= 60;
  };

  return (
    <>
      {/* 타이머 영역 */}
      <div
        className="-z-0 cursor-pointer relative bg-gray-50 text-gray-200 p-12 text-centers flex flex-col items-center justify-center rounded mb-4 bg-cover bg-center"
        style={{
          backgroundImage: `url(${coins[0]?.imgUrl || "fallback-image-url"})`,
        }}
        onClick={() => setIsModalOpen(true)} // 클릭 시 모달 열기
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
                Next coin in<br />
                <span className="text-pink-600">{timer.remainingTime}</span>
              </span>
            )}
          </p>
          <p className="text-gray-400">generating cycle: {timer.totalTime}</p>
          <p className="text-white">Powered by <span className="text-blue-400">Google RSS </span> and <span className="text-green-400">GPT</span></p>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 배경 */}
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={() => setIsModalOpen(false)} // 배경 클릭 시 닫기
          ></div>

          {/* 모달 내용 */}
          <div className="relative bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
  <h2 className="text-2xl font-bold mb-4 text-gray-800">
    Real-time News Analysis
  </h2>
  <p className="text-gray-600 mb-4">
    This system performs real-time analysis of 
    <br />
    <a
      className="text-blue-600 underline"
      href="https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"
      target="_blank"
      rel="noopener noreferrer"
    >
      Google News RSS
    </a> data, updated every 6 hours, specifically focusing on the latest English-language news articles.
  </p>
  <p className="text-gray-600 mb-4">
    Using GPT, the system evaluates the <span className="font-semibold text-pink-500">popularity</span> and
    <span className="font-semibold text-pink-500"> significance</span> of the articles, identifying key insights and selecting one prominent news story.
  </p>
  <p className="text-gray-600 mb-4">
    During this process, GPT analyzes <span className="font-semibold text-pink-500">keywords</span> and generates 
    <span className="font-semibold text-pink-500"> creative imagery</span>, transforming the selected news into a unique meme coin.
  </p>
  <p className="text-gray-600 font-semibold">
    This is where technology meets creativity, turning real-time news into the trendiest digital assets.
  </p>
  <button
    onClick={() => setIsModalOpen(false)} // 닫기 버튼
    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
  >
    ✕
  </button>
</div>

        </div>
      )}
    </>
  );
}
