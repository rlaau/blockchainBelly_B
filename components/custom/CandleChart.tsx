'use client'; // 클라이언트 컴포넌트로 설정

import React from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface CandleData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface CandleChartProps {
  data: CandleData[];
}

const CandleChart: React.FC<CandleChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 450 }}>
      <ResponsiveContainer>
        <ComposedChart data={data}  >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDataOverflow={true} />
          <Tooltip
  wrapperStyle={{
    backgroundColor: '#111827',
    border: '1px solid #1F2937', // #111827보다 밝은 색상
    borderRadius: '8px', // 라운드 추가
  }}
  contentStyle={{
    backgroundColor: '#111827',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px', // 내부 내용도 동일하게 라운드 적용
  }}
/>          <Legend />
          <Bar dataKey="close" fill="#2563EB" />
          <Line type="monotone" dataKey="open" stroke="#db2777" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandleChart;
