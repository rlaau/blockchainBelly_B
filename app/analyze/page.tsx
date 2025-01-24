"use client"
import BarChart from "@/components/custom/barChart";
import { useEffect, useState, useCallback } from "react";
import { ANav } from "./aNav";
import Image from 'next/image';
import { formatKind } from "@/components/custom/barChart";
import Link from "next/link";
function convertor(
    kind: string,
    kvList: [string, [number, number]][],
    sortType: string
  ): BarChartProps {
    // 데이터 리스트 변환
    const dataList = kvList
      .map(([key, [count, viewCount]]) => ({
        label: key,
        value: sortType === "genCount" ? count : viewCount, // 정렬 기준에 따라 value 결정
      }))
      .sort((a, b) => b.value - a.value); // 내림차순 정렬
  
    // 최대값 계산
    const maxValue = Math.max(...dataList.map((item) => item.value), 0);
  
    return {
      kind,
      data: dataList,
      maxValue,
    };
  }
const Page = () => {
    const [data, setData] = useState<SortedResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sortType, setSortType] = useState("genCount"); // 정렬 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [mostCoin, setMostCoin] = useState<Coin| null>(null); 
      // API에서 데이터 가져오기
  // API에서 데이터 가져오기
  // (1) 코인 목록 가져오기 (페이지네이션)
  // 의존성에서 isLoading을 제거하여, isLoading 변경 시 함수가 재생성되지 않도록 함
      // 가장 인기 있는 코인 가져오기
      useEffect(() => {
        const fetchMostCoin = async () => {
            try {
                const res = await fetch(`/api/coins?sort=popularity&page=1&limit=0`, { cache: "no-store" });
                const data = await res.json();
                setMostCoin(data[0]); // 가장 인기 있는 코인 설정
            } catch (err) {
                console.error("Failed to fetch the most popular coin:", err);
            }
        };

        fetchMostCoin();
    }, [sortType]);
  const fetchDict = useCallback(
    async () => {
      // 이미 로딩 중이면 중복 요청 방지
      if (isLoading) return;

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/coins/analyze?sort=${sortType}`,
          { cache: "no-store" }
        );
        const d:SortedResult = await res.json();

    

            setData(d);
          
        
      } catch (err) {
        setError("kk")
        console.error("Failed to fetch coins:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [sortType]
  );
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} - ${hours}h${minutes}m`;
  };
  // (2) 정렬 기준 or waiting 상태 바뀔 때, 페이지 초기화 후 첫 페이지 로드
  useEffect(() => {
    fetchDict();
    // isWaiting, sortType이 바뀔 때마다 fetchCoins(0) 재실행
  }, [fetchDict, sortType]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-pink-600">Analyzing...</div>;
  }
  if ( Object.keys(data).length === 0) {
    return <div className="text-pink-600">No data available.</div>;
  }
  type DataType = {
    [key: string]: string; // 인덱스 시그니처 추가
  };
  
  const colorThemes: DataType  = {
    keyWord: "bg-blue-900",
    majorPeople:"bg-purple-950",
    field:"bg-green-950",
    region: "bg-red-950",
    eventClassification:"bg-yellow-950",
  };
  
return (
    <div className="w-full sm:p-12 pt-8 ">
        <ANav onSortChange={setSortType} currentSort={sortType}/>
        <div className="flex flex-col gap-y-16 w-full pt-16 sm:pt-20">
          <div className="flex flex-col">
          <p className="text-2xl font-bold pb-4 pt-8">Most Popular Coin in 7 Days </p> 
          <div>  {mostCoin ?     
            
<Link href={`/getCoins/${mostCoin._id}/0.0`} className="grid grid-cols-7 gap-1 pt-2">
                    <div className="relative aspect-[1/1] col-span-2 rounded-lg overflow-hidden">
                        <Image
                            src={mostCoin.imgUrl ? mostCoin.imgUrl : "kk"}
                            fill
                            alt={mostCoin.title}
                            className="object-cotain object-top"
                        />
                    </div>
<div className="col-span-5 flex flex-col gap-y-4 ml-6">
  <h1 className="text-3xl font-bold">{mostCoin.coinName}</h1>
  <div className="flex gap-x-1 text-lg font-bold items-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      >
                      <path
                        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        ></path>
                    </svg>
                    viewCount {mostCoin.viewCount}
                  </div>
  <h2 className="text-lg text-gray-200">{mostCoin.description}</h2>
                        <h3 className="text-gray-500">{formatDate(String(mostCoin.createdAt))}</h3>
  <div className="flex flex-col text-pink-600 text-lg">
  <h4 >{mostCoin.tokenAddress? mostCoin.tokenAddress: "No token address"}</h4>
  <h4 >{mostCoin.poolAddress? mostCoin.poolAddress: "No pool address"}</h4>
  </div>
</div>

</Link>
     : "Loading..."} </div>
          </div>
    <div className="flex flex-col">
        <p className="text-2xl font-bold pb-4 pt-8">7-Day Trends </p> 
        
        <div className="flex justify-center gap-6 bg-gray-900 py-6 rounded-md shadow-md w-full flex-wrap">
  {Object.entries(data).map(([field, values]) => {
    const sortedValues = [...values].sort((a, b) =>
      sortType === "genCount" ? b[1][0] - a[1][0] : b[1][1] - a[1][1]
    ); // 정렬 기준에 따라 값 정렬
    const topItem = sortedValues[0]; // 1등 추출
    const theme = colorThemes[field] || "bg-gray-600";
    return (
      <div
        key={field}
        className={`${theme} flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-md`}
      >
        <h3 className="text-lg">{formatKind(field)}</h3>
        <p className="text-xl font-bold text-white">{topItem[0]}</p>
        <span className="text-sm text-gray-400">
          {sortType === "genCount"
            ? `${topItem[1][0]} times`
            : `${topItem[1][1]} views`}
        </span>
      </div>
    );
  })}
</div>
</div>
<div>
    <span className="text-2xl font-bold">Trend Analytics</span>
<div className="flex flex-col gap-y-16 pt-4">
        {Object.entries(data).map(([field, values], index) => {
         const converted = convertor(field,values,sortType);
        return (
        <BarChart
          key={index}
        kind={converted.kind}
        data={converted.data}
        maxValue={converted.maxValue}
    />
  );
})}
</div>
</div>
        </div>
    </div>
  );
};

export default Page;
