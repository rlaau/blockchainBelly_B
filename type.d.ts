import { ObjectId } from 'mongodb';
declare global{
    interface Coin {
        _id?: ObjectId;
        title: string;
        imgUrl: string;
        content: string;
        createdAt: Date; // Date 문자열
      }
      
}
export {};