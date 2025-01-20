import { connectDB } from '@/database';
import { ObjectId } from 'mongodb';
import  Image  from 'next/image';
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
        <main className="container justify-center items-center py-0 px-2 m-0 sm:px-16 lg:px-28 xl:px-36 pb-4">
            <nav>navigation</nav>
            <div className="w-full flex flex-col lg:flex-row pt-0  gap-x-4">
            <div className="w-full pb-8">
            <div className="bg-name/10 relative sm:rounded-xl overflow-hidden lg:basis-3/5 aspect-[5/3]">
            <Image
              src={coin.imgUrl ? coin.imgUrl :"kk"}
              alt="null"
              fill
              className="object-contain z-20 "
            />
          </div>
            </div>
            </div>
        </main>
    )
  }