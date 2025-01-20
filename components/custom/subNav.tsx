'use client';
import { useRouter } from 'next/navigation';

interface SubNavProps {
  onSortChange: (sortType: string) => void; // 정렬 상태 변경 콜백
  currentSort: string; // 현재 정렬 상태
}

const SubNav = ({ onSortChange, currentSort }: SubNavProps) => {
  const router = useRouter();

  // 현재 정렬 상태와 비교하여 활성 상태인지 확인
  const isActive = (sortType: string) => currentSort === sortType;

  const handleSortChange = (sortType: string) => {
    onSortChange(sortType); // 부모 컴포넌트에 정렬 상태 전달
    router.push('/'); // 현재 페이지로 이동
  };

  return (
    <div className="fixed z-10 bg-slate-950 pt-12 sm:pt-4 w-full flex gap-x-8 items-center">
      <h2
        className={`cursor-pointer text-md font-semibold pb-2 px-4 ${
          isActive('time')
            ? 'border-b-2 border-pink-600 text-foreground'
            : 'text-muted-foreground'
        }`}
        onClick={() => handleSortChange('time')}
      >
        Latest
      </h2>
      <h2
        className={`cursor-pointer pb-2 text-md font-semibold px-4 ${
          isActive('popularity')
            ? 'border-b-2 border-pink-600 text-foreground'
            : 'text-muted-foreground'
        }`}
        onClick={() => handleSortChange('popularity')}
      >
        Popular
      </h2>
      <h2
        className={`cursor-pointer pb-2 text-md font-semibold px-4 ${
          isActive('price')
            ? 'border-b-2  border-pink-600  text-foreground'
            : 'text-muted-foreground'
        }`}
        onClick={() => handleSortChange('price')}
      >
        Premium
      </h2>
    </div>
  );
};

export { SubNav };
