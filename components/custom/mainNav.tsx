import { Input } from '@/components/ui/input';
import Link from 'next/link';

async function MainNav({ where = 'home' }: { where?: string }) {
  return (
    <nav className="w-full flex pt-4 pb-3 justify-between bg-background">
      <div className="flex basis-1/2 justify-start gap-x-5">
        <Link
          href={'/'}
          className="lg:text-2xl lg:font-bold text-xl font-semibold"
        >
          Trend.pump
        </Link>
        {where === 'home' ? (
          <div className="flex ml-6 gap-x-2 lg:gap-x-5 ">
            <Link href={'/'} className="text-md lg:text-lg font-medium border-b-2 px-2 border-pink-600 ">
              History
            </Link>
            <Link
              href={'/community'}
              className="text-md lg:text-lg px-2 font-medium text-muted-foreground"
            >
              Trends
            </Link>
          </div>
        ) : (
          <div className="flex ml-6  gap-x-2 lg:gap-x-5">
            <Link
              href={'/'}
              className="text-md lg:text-lg px-2 font-medium text-muted-foreground "
            >
              History
            </Link>
            <Link
              href={'/community'}
              className="text-md lg:text-lg font-medium px-2 text-medium border-b-2  border-pink-600"
            >
               Trends
            </Link>
          </div>
        )}
      </div>
      <div className="flex basis-1/2 justify-end md:gap-x-8 gap-x-3 items-center">
        <Input
          placeholder="Search"
          className="max-w-48 min-w-32 hidden sm:block"
        />
        <svg
          width="21"
          height="21"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block sm:hidden"
        >
          <path
            d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>

      </div>
    </nav>
  );
}
export { MainNav };
