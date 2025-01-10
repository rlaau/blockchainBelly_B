//import { ObjectId } from 'mongodb';
//import { auth } from '@/auth';
//import { connectDB } from '@/database';
export async function POST(req: Request) {
  try {

    const body = await req.json(); 

    const bodyStr = JSON.stringify(body);

    console.log("Request body:", bodyStr);
    //예제 코드
    // const db = await connectDB();
    // const result = await db.collection('your-collection').insertOne(body);

        return new Response("success!", { status: 200 });
    }
   catch (error) {
       // 서버 내부 오류 처리
    console.error('API 오류:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
export async function GET() {
    try {
      // const { searchParams } = new URL(req.url);
  
      // // 특정 쿼리 파라미터 가져오기
      // const param1 = searchParams.get('wellCome'); 
  
      // console.log('well come:', param1);
  
      // 응답 데이터 생성
      const responseData = {
        message: 'Well come!',
        // receivedParams: {
        //   param1,
        // },
      };
  
      // JSON 응답 반환
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('API 오류:', error);
  
      // 서버 내부 오류 처리
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  