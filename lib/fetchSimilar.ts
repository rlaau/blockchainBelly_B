export async function FetchSimilarCoins(coin: Coin, field: keyof Coin, num: number) {
    try {
      const targetValue = coin[field];
      if (!targetValue) throw new Error("Invalid field value");
  
      const queryParams = new URLSearchParams({
        field: field.toString(),
        value: targetValue.toString(),
        num: num.toString(),
      });
  
      // 브라우저 환경에서만 절대 URL 생성
      const baseUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}`
          : process.env.BASE_URL // 서버 환경에서는 기본 URL 사용
  
      const url = `${baseUrl}/api/coins/similar?${queryParams.toString()}`;
  
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      
      let data: Coin[] = await res.json();
      data = data.filter((c) => c._id?.toString() !== coin._id?.toString());

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch similar coins:", error);
      return [];
    }
  }
  