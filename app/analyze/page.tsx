"use client"
import BarChart from "@/components/custom/barChart";
import { useEffect, useState, useCallback } from "react";
import { ANav } from "./aNav";
import { formatKind } from "@/components/custom/barChart";
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
      // API에서 데이터 가져오기
  // API에서 데이터 가져오기
  // (1) 코인 목록 가져오기 (페이지네이션)
  // 의존성에서 isLoading을 제거하여, isLoading 변경 시 함수가 재생성되지 않도록 함
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
    <div className="w-full sm:p-12">
        <ANav onSortChange={setSortType} currentSort={sortType}/>
        <div className="flex flex-col gap-y-16 w-full pt-24 sm:pt-20">
    <div className="flex flex-col">
        <p className="text-2xl font-bold pb-4 pt-8">Top Trends </p> 
        
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
