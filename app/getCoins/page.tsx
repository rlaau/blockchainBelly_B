'use client';
import { useEffect, useState } from 'react';

interface Coin {
  _id: string;
  title: string;
  content: string;
  imgUrl: string;
  createdAt: string;
}

export default function GetCoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    fetch('/api/coins')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCoins(data);
        }
      })
      .catch((error) => console.error('Failed to fetch coins:', error));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coin List</h1>
      <a
        href="/createCoins"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Create New Coin
      </a>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coins.map((coin) => (
          <div key={coin._id} className="bg-white rounded shadow p-4">
            <img
              src={coin.imgUrl}
              alt={coin.title}
              className="w-full h-48 object-cover mb-2 rounded"
            />
            <h2 className="text-xl font-bold mb-1">{coin.title}</h2>
            <p className="text-gray-700 mb-1">{coin.content}</p>
            <p className="text-sm text-gray-500">
              Created At: {new Date(coin.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
