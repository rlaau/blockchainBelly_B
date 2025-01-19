import { ObjectId } from 'mongodb';
declare global{
    interface Coin {
        _id?: ObjectId;
        title: string;
        imgUrl: string;
        content: string;
        createdAt: Date; // Date 문자열
      }
      interface CoinNews {
        _id?: ObjectId;
        coinName: string;
        title: string;
        description: string;
        field: string;
        majorPeople: string[]; // array
        region: string;
        eventClassification: string;
        imgUrl?: string;
        createdAt: Date;
      }
      
}
export {};