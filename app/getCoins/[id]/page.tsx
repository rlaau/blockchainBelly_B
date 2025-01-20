import { connectDB } from '@/database';
import { ObjectId } from 'mongodb';
import { Suspense } from "react";
import  Image  from 'next/image';
import { SimiliarXXX } from '@/components/custom/similar';
import { FaTag, FaGlobe, FaUser, FaMapMarkerAlt, FaBookmark, FaClock  } from "react-icons/fa";
export default async function Page({ params}: { params: { id: string }; }){
    const waitedParams = await Promise.resolve(params); 
    const id =waitedParams.id

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


    return (
      <main className="container justify-center items-center py-0 px-0 m-0 sm:px-12 lg:px-20 xl:px-28 pb-4 mt-16">
        <div className="w-full flex flex-col lg:flex-row pt-0  gap-x-4">
          <div className="w-full pb-8 ">
            <div className="bg-name/10 relative sm:rounded-xl overflow-hidden lg:basis-3/5 aspect-[5/3] bg-slate-900">
              <Image
                src={coin.imgUrl||"kk"}
                alt={coin.coinName}
                fill
                className="object-contain "
              />
            </div>
            <div className="px-2">
              <div className='flex justify-start pt-8'>
              <h2 className="text-4xl text-first pb-2">{coin.coinName}</h2>                   
              </div>
              <div className=" flex justify-start pb-0">
                <p className='text-xl font-bold text-pink-600 pr-5'>
                  currently {coin.price||"??"}$
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
<Category coin={coin}/>
              <div className="p-2 bg-name/10 mt-12 py-8 -ml-2 border-t-2 border-b-2 border-gray-200 rounded-none">
                <i className="text-2xl">{coin.title}</i>
                <p className='text-md mt-4'>: {coin.description}</p>
              </div>
              <div className="pt-8">
                <p>nn개의 댓글</p>
                <p>댓글 로드하기기</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:basis-2/5 px-4 md:px-8 flex flex-col gap-y-6 bg-gray-900 rounded-lg">

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
      <div className="flex flex-wrap gap-4 bg-gray-900 p-2 mt-4 rounded-md shadow-md">
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