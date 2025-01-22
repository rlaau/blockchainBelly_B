import { ObjectId } from 'mongodb';
declare global{
  type TimerResponse = {
    remainingTime: string;
    totalTime: string;
  };
  type SortedResult = Record<string, [string, [number, number]][]>;
  type BarChartProps = {
    kind: string;
    data: { label: string; value: number }[];
    maxValue: number; // 세로축의 최대값
  };
  
      interface Coin {
        _id?: ObjectId;
        tokenAddress?:string,
        poolAddress?:string,
        price?:number;
        keyWord: string;
        viewCount:number;
        coinName: string;
        title: string;
        description: string;
        field: "Economy" | "Society" | "Culture/Artistry" | "The international/World" | "Science/Technology" | "Sports" | "Entertainment" | "Health/Medical care" | "Environment" | "Education" | "Accident";
        majorPeople: string[]; // array
        region: string;
        eventClassification: "Breaking News" | "Announcement" | "Accident" | "Scandal" | "Natural Disaster" | "Political Development" | "Economic Update" | "Sports Update" | "Cultural Event" | "Technological Advance" | "Health Alert" | "Educational News" | "Environmental Update" | "International Relations" | "Human Interest Story" | "Opinion Piece" | "Editorial" | "Analysis" | "Prediction" | "Celebration" | "Award" | "Conference" | "Research Finding" | "Crime" | "Trial/Court Case" | "Entertainment Update" | "Product Launch" | "Scientific Discovery" | "Travel Advisory" | "Weather Report" | "Policy Change" | "Protest" | "Elections" | "Obituary" | "Reunion" | "Award Nomination" | "Fraud" | "Cybersecurity Incident" | "Space Exploration" | "Charity Event";
        imgUrl?: string;
        createdAt: Date;

        
      }
      
}
export {};