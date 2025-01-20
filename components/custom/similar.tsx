import { FetchSimilarCoins } from "@/lib/fetchSimilar";
import { use } from "react";
import Link from "next/link";

export function SimiliarXXX({ coin, targetField, num }: { coin: Coin, targetField:string,num:number  }) {
    const rfield = targetField as keyof Coin; 
    const targetValue=coin[rfield]
    if (!targetValue || (Array.isArray(targetValue) && targetValue.length === 0)) {
        return  <p>No same tag</p>;
      }
  
    const sameXXX = use(FetchSimilarCoins(coin,rfield, num)); 
    if (sameXXX.length === 0 || coin[rfield]==null ) {
        // 유사 키워드가 없는 경우
        return <p>No same tag</p>;
      }
    return (
      <ul className="pt-2 flex flex-col gap-y-1 text-balance">
        {sameXXX?.map((c, idx) => (
          <Link href={`/getCoins/${c._id}`} key={c._id?.toString()}>{idx+1}. {c.coinName}</Link>
        ))}
      </ul>
    );
}

