'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { getPrice } from '@/lib/getPrice';

export function CoinExternal({ coin }: { coin: Coin }) {
    const [price, setPrice] = useState("Fetching...");

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                if (coin.poolAddress) {
                    const fetchedPrice = await getPrice(coin.poolAddress);

                    if (fetchedPrice == "0.0") {
                        setPrice("0.0"); // 가격이 0이면 바로 설정
                    } else {
                         const tokenPrice = 1 / parseFloat(fetchedPrice); // 역수를 취해 1 토큰 가격 계산
                         setPrice(tokenPrice.toFixed(6)); // 소수점 6자리로 제한
                       
                    }
                } else {
                    setPrice("No pool address"); // poolAddress가 없는 경우 처리
                }
            } catch (error) {
                console.error("Error fetching price:", error);
                setPrice("Error fetching price");
            }
        };

        fetchPrice();
    }, [coin.poolAddress]); // poolAddress가 변경될 때마다 fetchPrice 실행

    return (
        <Card className="hover:brightness-150 transition ease-in-out duration-200">
            <Link href={`/getCoins/${coin._id}`}>
                <div className="relative aspect-[3/2] sm:aspect-[1/1] w-full overflow-hidden sm:rounded-lg">
                    <div className="relative aspect-[1/1]">
                        <Image
                            src={coin.imgUrl ? coin.imgUrl : "kk"}
                            fill
                            alt={coin.title}
                            className="object-cover object-top"
                        />
                    </div>
                    <div className="bottom-0 absolute aspect-[5/1] sm:aspect-[5/2] w-full px-2 md:px-6 pt-4 bg-background/50 backdrop-blur-3xl">
                        <div className="flex flex-col items-start justify-between">
                            <p className="text-first text-xl font-semibold pb-3 truncate">{coin.coinName}</p>
                            <p className="text-first text-balance text-xl pb-3 truncate text-pink-600">{price=="No pool address"? "No pool address":`${price} ETH`} </p>
                            <div className="flex justify-between gap-2 text-gray-300 text-sm">
                                <p>{coin.viewCount} watched</p>
                                <p>#{coin.keyWord}</p>
                            </div>
                            <p className="font-thin text-gray-300 text-sm pt-0 pb-4">
                                created at{" "}
                                {new Date(coin.createdAt)
                                    .toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    })
                                    .replace(",", "")
                                    .replace(/:/g, "h")
                                    .replace(" ", ":") + "m"}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </Card>
    );
}
