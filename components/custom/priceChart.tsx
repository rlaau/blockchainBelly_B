"use client";  // Next.js App Router에서 클라이언트 컴포넌트로 사용

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// priceHistory에 들어갈 데이터 구조
interface PriceData {
  time: number;   // timestamp
  price: number;  // 가격
}

interface PriceChartProps {
  data: PriceData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  // (선택) X축에 시간 표시를 위해 data를 가공할 수도 있음
  // 예) "time"값을 문자열로 변환
  const chartData = data.map((item) => ({
    ...item,
    // timeStr: new Date(item.time).toLocaleTimeString(),  // 시:분:초만
    // 혹은 full datetime: new Date(item.time).toLocaleString()
    // 여기서는 "time" 필드를 그대로 쓰되, XAxis의 tickFormatter로 처리하는 방법도 있음.
  }));

  return (
    <div style={{ width: "100%", height: 450 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          {/* 격자선 */}
          <CartesianGrid strokeDasharray="3 3" />
          {/* X축: time */}
          <XAxis
            dataKey="time"
            // timestamp를 바로 쓰면 숫자로 표시되므로, tickFormatter로 변환 가능
            tickFormatter={(value) => new Date(value).toLocaleTimeString('EN-us')}
          />
          {/* Y축 */}
          <YAxis allowDataOverflow={true} />
          {/* 툴팁 */}
          <Tooltip
            wrapperStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1F2937",
              borderRadius: "8px",
            }}
            contentStyle={{
              backgroundColor: "#111827",
              color: "#fff",
              padding: "10px",
              borderRadius: "8px",
            }}
            labelFormatter={(value) =>
              `Time: ${new Date(value).toLocaleString('En-us')}`
            }
          />
          {/* 범례 */}
          <Legend />
          {/* Line 차트: price */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#db2777"
            dot={false} // 점 표시를 지우고 싶다면 false
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
