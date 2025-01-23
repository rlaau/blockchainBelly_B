import { CoinExternal } from "@/components/custom/coinExtenal";

export default async function Page({ params }: { params: { kw: string } }) {
  const awaitedParams = await Promise.resolve(params);
  const keyWord = decodeURIComponent(awaitedParams.kw);
  if (!keyWord) {
    throw new Error("keyWord not provided in params");
  }

  const getByKeyWord = async (keyWord: string) => {
    try {
      const res = await fetch(`${process.env.BASE_URL}/api/searchByKeyWord?keyWord=${keyWord}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch coins for keyWord: ${keyWord}`);
      }
      const data = await res.json();
      return data; // 코인 배열 반환
    } catch (error) {
      console.error("Failed to fetch coins:", error);
      return [];
    }
  };

  const coins = await getByKeyWord(keyWord);

  return (
    <main className="w-full sm:p-12 mx-auto">
      <h1 className="text-3xl py-4 font-bold mb-4 pt-8">Coins for {"\""}{keyWord}{"\""}</h1>

      {/* 코인 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coins.map((coin: Coin) => (
          <CoinExternal key={String(coin._id)} coin={coin} />
        ))}
      </div>

      {/* 로딩 실패 또는 결과 없음 */}
      {coins.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No coins found for the keyWord {"\""}{keyWord}{"\""}.
        </p>
      )}
    </main>
  );
}
