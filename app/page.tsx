"use client";

import { useEffect, useState, useCallback } from "react";
import { CoinExternal } from "@/components/custom/coinExtenal";
import { SubNav } from "@/components/custom/subNav";
import { Timer } from "@/components/custom/timer";
import TrendingKeyWords from "@/components/custom/TrendingKeyWords";


export default function GetCoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [sortType, setSortType] = useState("time"); // 정렬 상태
  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState(0);     
  console.log(page)         // 현재 페이지 번호
  const [hasMore, setHasMore] = useState(true);     // 더 로드할 코인이 있는지 여부
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  const ITEMS_PER_PAGE = 24; // 한 번에 가져올 코인 수

  // Timer 컴포넌트가 전달하는 waiting 상태를 받는 콜백
  const handleWaitingStatusChange = (waiting: boolean) => {
    setIsWaiting(waiting);
  };

  // (1) 코인 목록 가져오기 (페이지네이션)
  // 의존성에서 isLoading을 제거하여, isLoading 변경 시 함수가 재생성되지 않도록 함
  const fetchCoins = useCallback(
    async (currentPage: number, append: boolean) => {
      // 이미 로딩 중이면 중복 요청 방지
      if (isLoading) return;

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/coins?sort=${sortType}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          if (append) {
            // 기존 coins 배열에 새 데이터를 덧붙임
            setCoins((prev) => {
              const merged = [...prev, ...data];
              // _id 중복 제거
              return merged.filter(
                (coin, index, self) =>
                  index === self.findIndex((c) => c._id === coin._id)
              );
            });
          } else {
            setCoins(data);
          }
          // 더 이상 가져올 데이터가 없으면 hasMore = false
          setHasMore(data.length >= ITEMS_PER_PAGE);
        }
      } catch (err) {
        console.error("Failed to fetch coins:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [sortType /* isLoading 제거 */]
  );

  // (2) 정렬 기준 or waiting 상태 바뀔 때, 페이지 초기화 후 첫 페이지 로드
  useEffect(() => {
    setPage(0);
    fetchCoins(0, false);
    // isWaiting, sortType이 바뀔 때마다 fetchCoins(0) 재실행
  }, [fetchCoins, sortType, isWaiting]);

  // (3) 스크롤 이벤트 → 최하단 도달 시 다음 페이지 요청
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    // 여유 높이 (100px) 준다
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      // 다음 페이지로
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        if (isLoading){
          return prevPage
        }else {
          fetchCoins(nextPage, true);
        return nextPage}
      });
    }
  }, [hasMore, isLoading, fetchCoins]);

  // (4) 스크롤 이벤트 등록
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <main className="w-full sm:p-12 mx-auto pt-8 ">
      {/* SubNav: 정렬 옵션 변경 */}
      <SubNav onSortChange={setSortType} currentSort={sortType} />

      <div className="pt-4 mt-12">
        {/* Timer */}
        <Timer onWaitingStatusChange={handleWaitingStatusChange} />
      </div>

<TrendingKeyWords/>
      <h1 className="text-3xl pt-12 pb-4 font-bold mb-4">Generated Coins
</h1>

      {/* 코인 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coins.map((coin) => (
          <CoinExternal key={String(coin._id)} coin={coin} />
        ))}
      </div>

      {/* 더 이상 로드할 것 없음 */}
      {!hasMore && (
        <p className="text-center text-gray-500 mt-4">No more coins to load.</p>
      )}

      {/* 로딩 표시 */}
      {isLoading && (
        <p className="text-center text-pink-600 mt-4">Loading...</p>
      )}
    </main>
  );
}
