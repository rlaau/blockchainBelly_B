
import { connectDB } from '@/database';
import { ObjectId } from 'mongodb';
import { Suspense } from "react";
import  Image  from 'next/image';
import { SimiliarXXX } from '@/components/custom/similar';
import CommentSection from './commentSection';
import { FaTag, FaGlobe, FaUser, FaMapMarkerAlt, FaBookmark, FaClock  } from "react-icons/fa";
import CandleChart from '@/components/custom/CandleChart'


export default async function Page({ params }: { params: { id: string; price: string } }){

  const awaitedParams = await Promise.resolve(params); 
  const id = awaitedParams.id;
  const rawPrice=awaitedParams.price


  const price = decodeURIComponent(rawPrice);
  if (!id) {
      throw new Error('ID not provided in params');
  }
    if (!id) {
      throw new Error('ID not provided in params');
    }
    const db = (await connectDB).db('postings');
    const coin = (await db.collection('coins').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } },
      {
        returnDocument: 'after',
      }
    )) as Coin;
    let isKeywordSent = false;
    const sendSearchData = async (keyWord: string) => {
      if (isKeywordSent) return;
      isKeywordSent = true;
      try {
        await fetch(`${process.env.BASE_URL}/api/coins/realTime`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyWord }),
        });
      } catch (error) {
        console.error('Failed to send search data:', error);
      }
    };

    await sendSearchData(coin.keyWord )



    interface DataItem {
      time: string;
      open: number;
      close: number;
      high: number;
      low: number;
    }
    
    const shuffleArray = (array: DataItem[]): DataItem[] => {
      const newArray = [...array]; // 원본 배열을 변경하지 않기 위해 복사
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지의 랜덤 인덱스
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // 요소 교환
      }
      return newArray;
    };
    
    // 원본 배열
    const data = [
      { time: '17:00', open: 0.0000084, close: 0.0000035, high: 0.00000355, low: 0.00000125 },
      { time: '17:05', open: 0.0000035, close: 0.0000034, high: 0.0000036, low: 0.00000235 },
      { time: '17:10', open: 0.0000034, close: 0.0000033, high: 0.0000035, low: 0.0000032 },
      { time: '17:15', open: 0.0000033, close: 0.0000034, high: 0.00000395, low: 0.0000031 },
      { time: '17:15', open: 0.0000045, close: 0.0000034, high: 0.00000345, low: 0.0000031 },
      { time: '17:15', open: 0.0000039, close: 0.0000078, high: 0.00000445, low: 0.0000011 },
      { time: '17:15', open: 0.0000033, close: 0.0000088, high: 0.00000645, low: 0.0000031 },
      { time: '17:15', open: 0.0000033, close: 0.0000034, high: 0.00000745, low: 0.0000021 },
      { time: '17:20', open: 0.0000034, close: 0.0000099, high: 0.0000035, low: 0.00000315 },
    ];
    
    // 배열을 섞어서 반환
    const shuffledData = shuffleArray(data);

    return (
      <main className="container justify-center items-center py-0 px-0 m-0 sm:px-12 lg:px-20  pb-4 mt-16">
        <div className="w-full flex flex-col lg:flex-row pt-0  gap-x-4 items-start">
          
          <div className="pt-4 w-full pb-8 flex flex-col gap-y-4 px-8">
          <h2 className="text-2xl text-first font-bold pb-2">{coin.coinName} coin</h2>      
            <div className='flex flex-col bg-gray-900 px-4 py-8 rounded-lg'>
    
            <CandleChart data={shuffledData} />
            </div>
            <div >
              <div className='w-full flex justify-start h-40 items-start self-start content-start align-top  pt-4 '>
              <div className="h-full relative sm:rounded-xl overflow-hidden aspect-[1/1]  bg-slate-900">
              <Image
                src={coin.imgUrl||"kk"}
                alt={coin.coinName}
                fill
                className="object-contain "
              />
            </div> 
              <div className='w-auto h-full pl-8 items-start self-start content-start align-top flex flex-col'>
              <div className='flex justify-start pt-8 pb-2'>
              <h2 className="text-4xl text-first pb-2">{coin.coinName}</h2>    
              </div>
              
              <div className=" flex justify-start pb-0">
                
                <p className='text-xl font-bold text-pink-600 pr-5'>
                 
                  {price=="No pool address"?"No pool address":`${price} Eth`}
                </p>
                  <div className="flex gap-x-1 items-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    viewCount {coin.viewCount}
                  </div>
              </div>
              
              </div>

              </div>

<Category coin={coin}/>
              <div className="p-2 bg-name/10 mt-12 py-8 -ml-2 border-t-2 border-b-2 border-gray-200 rounded-none">
                <i className="text-2xl">{coin.title}</i>
                <p className='text-md mt-4'>: {coin.description}</p>
              </div>
              <div className="pt-8">
              <Suspense fallback={<p>Loading comments...</p>}>
                <CommentSection coinId={id} />
            </Suspense>
            
              </div>
            </div>
          </div>
          <div className="pt-4 w-full lg:basis-2/5 px-4 md:px-8 flex flex-col gap-y-6 bg-gray-900 rounded-lg">

          <div className='text-xl pt-4 font-bold'>Related Coins</div>

<div>
            <div className="flex items-center gap-2 text-gray-100">
        <FaTag className="text-blue-500" />
        <p className="font-medium"> <span className='text-blue-500'>{coin.keyWord || "N/A"}</span> </p>
      </div>
              <Suspense fallback={<p>loading</p>}>
 <SimiliarXXX coin={coin} targetField={"keyWord"} num={10}/>
              </Suspense>
              </div>



              <div>
            <div className="flex items-center gap-2  text-gray-100">
        <FaUser className="text-purple-500" />
        <p className="font-medium">
         <span className="text-purple-500">{coin.majorPeople.length > 0 ? coin.majorPeople.join(", ") : "None"}</span> 
        </p>
      </div>
              <Suspense fallback={<p>loading</p>}>
 <SimiliarXXX coin={coin} targetField={"majorPeople"} num={10}/>
              </Suspense>
              </div>





              <div>
              <div className="flex items-center gap-2  text-gray-100">
        <FaBookmark className="text-green-500" />
        <p className="font-medium"><span className="text-green-500">{coin.field || "Unknown Field"} </span></p>
      </div>
              <Suspense fallback={<p>loading</p>}>
 <SimiliarXXX coin={coin} targetField={"field"} num={10}/>
              </Suspense>
              </div>





           
           
   
            <div>
            </div>
          </div>
        </div>
      </main>
    );
  }



function Category ({coin}:{coin:Coin}){
    // 날짜 포맷터 (YYYY/MM/DD - HHhMMm)
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}/${month}/${day} - ${hours}h${minutes}m`;
    };
    return (
      <div className="flex flex-wrap gap-4 bg-gray-900 p-2 mt-8 rounded-md shadow-md">
      {/* 키워드 */}
      <div className="flex items-center gap-2 text-gray-100">
        <FaTag className="text-blue-500" />
        <p className="font-medium">{coin.keyWord || "N/A"}</p>
      </div>
      {/* 주요 인물 */}
      <div className="flex items-center gap-2  text-gray-100">
        <FaUser className="text-purple-500" />
        <p className="font-medium">
          {coin.majorPeople.length > 0 ? coin.majorPeople.join(", ") : "No major people"}
        </p>
      </div>

      {/* 분야 */}
      <div className="flex items-center gap-2  text-gray-100">
        <FaBookmark className="text-green-500" />
        <p className="font-medium">{coin.field || "Unknown Field"}</p>
      </div>


      {/* 지역 */}
      <div className="flex items-center gap-2  text-gray-100">
        <FaMapMarkerAlt className="text-red-500" />
        <p className="font-medium">{coin.region || "Unknown Region"}</p>
      </div>
      {/* 시간간 */}
      <div className="flex items-center gap-2 text-gray-100">
        <FaClock className="text-teal-500" />
        <p className="font-medium">{formatDate(String(coin.createdAt))}</p>
      </div>
      {/* 이벤트 분류 */}
      <div className="flex items-center gap-2  text-gray-100">
        <FaGlobe className="text-yellow-500" />
        <p className="font-medium">{coin.eventClassification || "Unclassified"}</p>
      </div>
    </div>
    )
}
