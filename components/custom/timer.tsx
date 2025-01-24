"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import PriceChart from "@/components/custom/priceChart";

interface TimerResponse {
  remainingTime: string;
  totalTime: string;
}

interface Coin {
  _id: string;
  keyWord: string;
  createdAt: string;
  imgUrl: string;
}

interface Reservation {
  _id: string;
  walletAddress: string;
  tokenAmount: number;
  ethAmount: number;
  createdAt: string; // 날짜
}

interface PricePoint {
  time: number; // Date.now() (timestamp) or reservation.createdAt timestamp
  price: number;
}

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // 사이트 설명 모달

  // 예약 관련 state
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [ethAmount, setEthAmount] = useState("");

  // 예약 내역
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // "가격 시계열" 저장
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  // --- 1) 최신 코인 fetch ---
  const fetchLatestCoin = async () => {
    try {
      const res = await fetch("/api/coins", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const latestCoin = data.sort(
          (a: Coin, b: Coin) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setCoins([latestCoin]);
      }
    } catch (error) {
      console.error("Failed to fetch latest coin:", error);
    }
  };

  // --- 2) 예약 내역 fetch ---
  const fetchReservations = async () => {
    if (!coins[0]?._id) return;
    try {
      const res = await fetch(`/api/reservation?coinId=${coins[0]._id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch reservations");
      }
      const data: Reservation[] = await res.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  // --- 3) 타이머 fetch ---
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

  // --- 4) 코인 정보, 대기 상태 ---
  useEffect(() => {
    fetchLatestCoin();
  }, [isWaiting]);

  useEffect(() => {
    onWaitingStatusChange(isWaiting);
  }, [isWaiting, onWaitingStatusChange]);

  // --- 5) 모달 열릴 때 예약 내역 갱신 ---
  useEffect(() => {
    if (isModalOpen) {
      fetchReservations();
    }
  }, [isModalOpen]);

  // --- 6) 로컬 스토리지에서 지갑 주소 가져오기 ---
  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  // --- 7) 폼 제출 -> 예약하기 ---
  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const coinId = coins[0]?._id;
    if (!coinId) {
      alert("코인 정보가 없습니다.");
      return;
    }
    if (!walletAddress) {
      alert("지갑 주소가 없습니다. 메타마스크 연결을 확인하세요.");
      return;
    }

    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          tokenAmount,
          ethAmount,
          coinId,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to create reservation");
      }

      const data = await res.json();
      console.log("Reservation success:", data);

      // 예약 생성 후 리스트 다시 갱신
      setTokenAmount("");
      setEthAmount("");
      fetchReservations();

      alert("예약이 완료되었습니다. \nID: " + data.reservationId);
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Error while creating reservation");
    }
  };

  // --- 8) 1분 이하 체크 ---
  const isTimeCritical = () => {
    const [hours, minutes, seconds] = timer.remainingTime
      .split(":")
      .map((str: string) => parseInt(str, 10));
    return hours === 0 && minutes === 0 && seconds <= 60;
  };

  // --- 9) 모든 예약을 기반으로 priceHistory 재생성 ---
  useEffect(() => {
    if (reservations.length === 0) {
      setPriceHistory([]);
      return;
    }

    // 1) reservations를 "createdAt" 오름차순 정렬
    const sorted = [...reservations].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 2) 부분합(누적)으로 ETH, 토큰 계산하며 시점별 price를 기록
    let runningEth = 0;
    let runningTokens = 0;

    const newHistory = sorted.map((r) => {
      runningEth += Number(r.ethAmount);
      runningTokens += Number(r.tokenAmount);

      // price
      const price =
        runningTokens > 0 ? parseFloat((runningEth / runningTokens).toFixed(6)) : 0;

      // time = 예약이 생성된 시간 (timestamp)
      const time = new Date(r.createdAt).getTime(); 
      return { time, price };
    });

    setPriceHistory(newHistory);
  }, [reservations]);

  // --- 10) 현재 "최종" 가격 (마지막 예약 기준)
  const lastPoint = priceHistory[priceHistory.length - 1];
  const currentPrice = lastPoint ? lastPoint.price : NaN;

  // 총합(최종) ETH / Token
  const totalEth = reservations.reduce((acc, r) => acc + Number(r.ethAmount), 0);
  const totalToken = reservations.reduce((acc, r) => acc + Number(r.tokenAmount), 0);

  return (
    <>
      {/* 타이머 영역 */}
      <div
        className="relative bg-gray-50 text-gray-200 p-12 text-center flex flex-col items-center justify-center rounded mb-4 bg-cover bg-center cursor-pointer -z-0"
        style={{
          backgroundImage: `url(${coins[0]?.imgUrl || "fallback-image-url"})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>

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
          {/* Google RSS & ChatGPT 텍스트 */}
          <p
            className="text-white z-10 cursor-pointer hover:underline"
            onClick={() => setIsInfoModalOpen(true)} // 클릭 시 설명 모달 열기
          >
            Powered by <span className="text-blue-400">Google RSS</span> and{" "}
            <span className="text-green-400">ChatGPT</span>
          </p>

          <div className="w-full mt-4 text-center">
            <button
              className="backdrop-blur-3xl font-bold z-40 border border-pink-600 p-4 w-full text-white text-3xl rounded-md shadow-md hover:text-pink-600 transition ease-in-out duration-200"
              onClick={() => setIsModalOpen(true)}
            >
              {isWaiting ? (
                <span>Pending Reservation...</span>
              ) : isTimeCritical() ? (
                <p className="text-pink-600 font-bold animate-pulse">
                  Reservation closes in{" "}
                  <span className="text-red-500">{timer.remainingTime}</span>
                </p>
              ) : (
                <p>Reserve Now</p>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 w-full flex items-center justify-center z-50">
          {/* 배경 어둡게 */}
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* 모달 내용 */}
          <ScrollArea
            className="
              relative backdrop-blur-3xl border border-pink-600 rounded-lg shadow-lg p-8 
              max-w-2xl w-full text-center
              h-[80vh] overflow-y-auto
            "
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* 모달 타이틀 */}
            <h2 className="text-2xl font-bold mb-4 text-white">
              예약 구매 (Reservation)
            </h2>

            {/* 가격 차트 */}
            <PriceChart data={priceHistory} />

            {/* ---- 현재 가격 표시 ---- */}
            <div className="mb-4">
              <p className="text-gray-200 font-semibold">
                현재 가격:{" "}
                <span className="text-pink-600 text-xl">
                  {isNaN(currentPrice) ? "N/A" : currentPrice}
                </span>
              </p>
              <p className="text-gray-400 text-sm">
                (총 ETH: {totalEth} / 총 토큰: {totalToken})
              </p>
            </div>

            {/* 예약 구매 설명 */}
            <p className="text-gray-400 mb-4">
              토큰, 지불 ETH를 입력하고 예약 구매를 진행해보세요.
              <br />
              현재 지갑:{" "}
              <span className="font-semibold text-white">
                {walletAddress || "N/A"}
              </span>
            </p>

            {/* --- 예약 구매 폼 --- */}
            <form onSubmit={handleReservationSubmit} className="space-y-4 mb-8">
              <div className="px-2">
                <label
                  htmlFor="tokenAmount"
                  className="block text-left text-gray-300 font-semibold mb-1"
                >
                  Token Amount
                </label>
                <input
                  id="tokenAmount"
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  className="w-full border bg-transparent rounded p-2 text-white"
                  placeholder="예: 1000"
                  required
                />
              </div>
              <div className="px-2">
                <label
                  htmlFor="ethAmount"
                  className="block text-left text-gray-300 font-semibold mb-1"
                >
                  ETH Amount
                </label>
                <input
                  id="ethAmount"
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="w-full border bg-transparent rounded p-2 text-white"
                  placeholder="예: 0.05"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-transparent border-pink-600 border text-white font-bold py-2 px-4 rounded hover:bg-pink-700 transition"
              >
                예약하기
              </button>
            </form>

            {/* --- 예약 주문 목록 (댓글창) --- */}
            <div className="text-left mb-8">
              <h3 className="text-xl font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-2">
                예약 주문 내역
              </h3>
              {reservations.length === 0 ? (
                <p className="text-gray-500">아직 예약 주문이 없습니다.</p>
              ) : (
                reservations.map((r) => (
                  <div
                    key={r._id}
                    className="border-b border-gray-600 py-2 px-1 mb-2"
                  >
                    <p className="font-bold text-gray-200">
                      {r.walletAddress}
                    </p>
                    <p className="text-sm text-gray-400">
                      Token: {r.tokenAmount} | ETH: {r.ethAmount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* --- 가격 시계열 (priceHistory) --- */}
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-2">
                가격 변동 히스토리
              </h3>
              {priceHistory.length === 0 ? (
                <p className="text-gray-500">아직 가격 이력이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {priceHistory.map((p, idx) => (
                    <div key={idx} className="text-sm text-gray-400">
                      <span className="font-semibold">
                        {new Date(p.time).toLocaleTimeString()}:
                      </span>{" "}
                      <span className="text-pink-600 font-bold">
                        {p.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* 사이트 설명 모달 */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={() => setIsInfoModalOpen(false)} // 배경 클릭 시 닫기
          ></div>
          <div className="relative backdrop-blur-3xl border-pink-600 border rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Real-time News Analysis
            </h2>
            <p className="text-gray-100 mb-4">
              This system performs real-time analysis of <br />
              <a
                className="text-blue-600 underline"
                href="https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google News RSS
              </a>{" "}
              data, updated every 6 hours, specifically focusing on the latest
              English-language news articles.
            </p>
            <p className="text-gray-100 mb-4">
              Using GPT, the system evaluates the{" "}
              <span className="font-semibold text-pink-500">popularity</span> and{" "}
              <span className="font-semibold text-pink-500">significance</span>{" "}
              of the articles, identifying key insights and selecting one
              prominent news story.
            </p>
            <p className="text-gray-100 mb-4">
              During this process, GPT analyzes{" "}
              <span className="font-semibold text-pink-500">keywords</span> and
              generates{" "}
              <span className="font-semibold text-pink-500">creative imagery</span>, 
              turning the selected news into a unique meme coin.
            </p>
 
            <button
              onClick={() => setIsInfoModalOpen(false)} // 닫기 버튼
              className="absolute top-2 right-2 text-white hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
