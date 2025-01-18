import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const options: MongoClientOptions = {}; // 필요한 옵션을 추가로 정의 가능
let connectDB: Promise<MongoClient>;

declare global {
  // Node.js 환경에서만 사용되는 전역 변수 선언
  // eslint-disable-next-line no-var
  var _mongo: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서 global._mongo 값 재사용
  // next dev환경에선, 프로세스를 유지한 채 리컴파일-코드 재시작 과정이 반복될 수 있음
  // 이떄 '프로세스는 유지되면서' 이 코드가 반복 실행되면, 한 프로세스에서 여러 연결이 만들어질 수 있기에, 방지용 코드.
  if (!global._mongo) {
    global._mongo = new MongoClient(uri, options).connect();
  }
  connectDB = global._mongo;
} else {
  // 프로덕션 환경에서는 새로운 클라이언트를 생성
  connectDB = new MongoClient(uri, options).connect();
}

export { connectDB };
