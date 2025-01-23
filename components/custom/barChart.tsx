import React from "react";
import Link from "next/link";
export function formatKind(kind: string): string {
    // 1. 대문자를 기준으로 띄어쓰기
    const spaced = kind.replace(/([A-Z])/g, " $1").trim();
    // 2. 첫 글자를 대문자로 변환
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
  }
const BarChart: React.FC<BarChartProps> = ({kind, data, maxValue }) => {
    type DataType = {
        [key: string]: string; // 인덱스 시그니처 추가
      };
      
      const colorThemes: DataType  = {
        keyWord: "border-blue-900",
        majorPeople:"border-purple-900",
        field:"border-green-900",
        region: "border-red-900",
        eventClassification:"border-yellow-900",
      };
      
  return (
    <div className={`${colorThemes[kind]} border-x-2 border-y-2 relative w-full  px-12 mx-auto  p-6 rounded-lg py-8 sm:py-12`} >
      {/* 제목 */}
      <h2 className="text-white text-2xl font-bold mb-16 -ml-6 ">{formatKind(kind)}</h2>
      
      {/* 그래프 전체 */}
      <div className="ml-12 flex justify-around space-x-2 sm:space-x-4 sm:h-96 h-64 sm:px-8 px-4">

{/* 각 막대 */}
{data.map((item, index) => {
  const barHeight = (item.value / maxValue) * 100; // 비율 계산

  const barContent = (
    <div
      key={index}
      className="group flex w-full max-w-32 truncate flex-col items-center justify-end h-full pt-16"
    >
      {/* 막대와 그룹 컨텍스트 */}
      <div
        className="relative group w-full flex justify-center"
        style={{
          height: `${barHeight}%`,
        }}
      >
        {/* 막대 */}
        <div className="bg-white rounded w-full transition-all group-hover:bg-pink-600"></div>

        {/* 툴팁 (hover 시 표시) */}
        <div className="text-center truncate absolute bottom-full mb-3 w-full hidden group-hover:flex items-center justify-center bg-pink-600 text-white text-sm font-semibold rounded-lg px-2 py-1">
          {item.label}:<br /> {item.value} times
        </div>
      </div>

      {/* 라벨 */}
      <span className="text-white group-hover:text-pink-600 text-start text-md mt-2 break-words">
        {item.label}
      </span>
    </div>
  );

  // kind가 "keyWord"일 경우 Link로 감싸기
  return kind === "keyWord" ? (
    <Link
      key={index}
      href={`/coinByKW/${encodeURIComponent(item.label)}`} // URL 인코딩된 label로 이동
      className="w-full h-full no-underline hover:underline"
    >
      {barContent}
    </Link>
  ) : (
    barContent
  );
})}
      </div>

      {/* 세로축 척도 */}

        <div className="sm:h-96 h-64 absolute left-8 bottom-16 flex flex-col justify-between  text-gray-300 text-sm">
          {[ maxValue,(maxValue * 3) / 4,maxValue / 2,maxValue / 4, 0 ].map(
            (tick, index) => (
              <span key={index}>{tick.toFixed(0)} times</span>
            )
          )}

      </div>
    </div>
  );
};

export default BarChart;
