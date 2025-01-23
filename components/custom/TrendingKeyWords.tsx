"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
export default function TrendingKeyWords() {
  const [keyWords, setKeyWords] = useState<{ keyWord: string; count: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeyWords = async () => {
      try {
        const response = await fetch(`/api/coins/realTime`);
        if (!response.ok) {
          throw new Error("Failed to fetch trending keywords");
        }
        const data = await response.json();
        setKeyWords(data);
      } catch (err) {
        console.error("Error fetching trending keywords:", err);
        setError("Failed to load trending keywords");
      }
    };

    fetchKeyWords();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!keyWords) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Hot Keywords <span className="text-base font-medium text-gray-300 pl-1">from last 1000 Searches</span></h2>
      <div className="grid grid-cols-5 gap-2">
        {keyWords.map(({ keyWord, count }, index) => (
          <Link href={`/coinByKW/${keyWord}`}  key={index}>
          <div
           
            className="flex-col w-auto flex-wrap gap-x-2 bg-pink-600 p-2 rounded-md shadow-sm"
          >
            <span className="font-semibold">{keyWord}</span>
            <br/>
            <span className="text-gray-300">{count?count:"no count"} views</span>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
