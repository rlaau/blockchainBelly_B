'use client'
import { useState } from 'react';
import {CoolInput, CoolButton} from "@/app/coolComponents"

export default function Home() {
  const [name, setName] = useState(''); // 입력된 이름 상태
  const [displayName, setDisplayName] = useState(''); // 화면에 표시될 이름 상태

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value); // 입력값 상태 업데이트
  };

  const handleButtonClick = () => {
    setDisplayName(name); // 화면에 표시될 이름 업데이트
  };

  return (
    <div className="bg-slate-800 grid-rows-[20px_1fr_20px] items-center justify-between min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="grid lg:gap-2  grid-cols-1 xl:grid-cols-2 gap-y-4 ">
      
    <CoolInput   value={name}   onChange={handleInputChange}/>
    <CoolButton onClick={handleButtonClick}/>
    </div>
    <div  className="items-center justify-center mt-8 text-xl font-bold text-center text-yellow-400">
        {displayName && <p>화이팅!: <strong>{displayName}</strong></p>}
      </div>
    </div>
  );
}
