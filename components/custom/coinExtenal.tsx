import { Card } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';

export function CoinExternal({coin}:{coin:Coin;} ){
    return(
        <Card>
            <Link href={ `/getCoins/${coin._id}`}>
                <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
                    <div className="relative aspect-[1/1]">
                        <Image
                            src={coin.imgUrl ? coin.imgUrl : "kk"}
                            fill
                            alt={coin.title}
                            className="object-cover object-top"
                            />
                    </div>
                    <div className="bottom-0  absolute aspect-[5/2] w-full px-2 md:px-6 pt-4  bg-background/50 backdrop-blur-3xl">
                        <div className="flex flex-col items-start justify-between">
                            <div className="flex gap-x-2 justify-start">
                                <p className="text-first text-xl font-semibold pb-2  truncate ">
                                    {coin.coinName}
                                </p>
                            </div>
                            <div className="flex gap-x-2 justify-start">
                                <p className="text-first text-xl  pb-2  truncate text-fuchsia-600">
                                    {coin.price? coin.price : "??"}$
                                </p>
                            </div>

                        </div>
                        <div className=" flex flex-col gap-y-3 pb-4  relative overflow-hidden rounded-none group">

                        </div>
                    </div>
                </div>
            </Link>
        </Card>
    )

}