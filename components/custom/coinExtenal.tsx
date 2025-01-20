import { Card } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';

export function CoinExternal({coin}:{coin:Coin;} ){
    return(
        <Card className='hover:brightness-150  transition ease-in-out duration-200 '>
            <Link href={ `/getCoins/${coin._id}`}>
                <div className="relative aspect-[3/2] sm:aspect-[1/1] w-full overflow-hidden sm:rounded-lg">
                    <div className="relative aspect-[1/1]">
                        <Image
                            src={coin.imgUrl ? coin.imgUrl : "kk"}
                            fill
                            alt={coin.title}
                            className="object-cover object-top"
                            />
                    </div>
                    <div className="bottom-0  absolute aspect-[5/1]  sm:aspect-[5/2] w-full px-2 md:px-6 pt-4  bg-background/50 backdrop-blur-3xl">
                        <div className="flex flex-col items-start justify-between">
                                <p className="text-first text-xl font-semibold pb-3  truncate ">
                                    {coin.coinName}
                                </p>
                                <p className="text-first text-xl  pb-3  truncate text-pink-600">
                                    {coin.price? coin.price : "??"}$
                                </p>
                            <div className='flex justify-between gap-2 text-gray-300 text-sm'>
                                <p>{coin.viewCount} watched</p>
                                <p>#{coin.keyWord}</p>
                            </div>
                            <p className='font-thin text-gray-300 text-sm pt-0 pb-4'>created at {new Date(coin.createdAt).toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).replace(',', '').replace(/:/g, 'h').replace(' ', ':') + 'm'}
 </p>
                        </div>

                    </div>
                </div>
            </Link>
        </Card>
    )

}