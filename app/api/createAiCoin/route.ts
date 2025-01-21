import { NextResponse } from "next/server";
import OpenAI from "openai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { connectDB } from "@/database"; // MongoDB 연결 함수
import Parser from "rss-parser";
// GET 라우트
export async function GET() {
    try {
      const coinText = await getCoinNewsText();
      if (!coinText) {
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
      }
  
      const insertedCoinImage = await insertCoinImageUrl(coinText);
      if (!insertedCoinImage) {
        return NextResponse.json({ error: "Failed to generate image or save data" }, { status: 500 });
      }
  
      return NextResponse.json(insertedCoinImage);
    } catch (err) {
      console.error("Error in GET /api/createAiCoin:", err);
      return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
    }
  }

export async function CreateCoin() : Promise<boolean> {
  const coinText = await getCoinNewsText();
  if (!coinText) {
    return false
  }
  const insertedCoinImage = await insertCoinImageUrl(coinText);
  if (!insertedCoinImage) {
    return false
  }
  return true
  
}
async function getCoinNewsText(): Promise<Coin | null> {
    try {
        // 1) Google 뉴스 "RSS" 주소 (영문 버전 예시)
        const rssUrl = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
        const parser = new Parser();
        const feed = await parser.parseURL(rssUrl);
    
        // 2) 기사 5개 추출
        const topItems = feed.items.slice(0, 5);
    
        // 3) 기사 내용을 문자열로 조합
        const articlesText = topItems
          .map((item, i) => {
            return `(${i + 1}) title: ${item.title}\n   description: ${item["content:encoded"] ||item.content|| item.contentSnippet || "No description available"}\n   link: ${item.link}\n`;
          })
          .join("\n");
    
        // 4) 사용자 지시사항(프롬프트)
        //    - 하나만 골라서 JSON 형태로 응답(극단적 뉴스는 제외)
        //    - field는 특정 enum 중 하나
        const userPrompt = `
    Here is a list of the top stories from Google News:
    
    ${articlesText}
    
    Please select one article following these guidelines:
    1. Choose the most attention-grabbing or impactful news story.
    2. Avoid news that contains highly personal or sensitive content(like crime, trial/court case, a serious and cruel accident ...etc), or news that could create issues if used as the basis for a product.
    
    {
      "coinName": string,
      "title": string,
      "keyWord":string,
      "description": string,
      "field": "Economy" | "Society" | "Culture/Artistry" | "The international/World" | "Science/Technology" | "Sports" | "Entertainment" | "Health/Medical care" | "Environment" | "Education" | "Accident",
      "majorPeople": array,
      "region": string,
      "eventClassification":"Breaking News" | "Announcement" | "Accident" | "Scandal" | "Natural Disaster" | "Political Development" | "Economic Update" | "Sports Update" | "Cultural Event" | "Technological Advance" | "Health Alert" | "Educational News" | "Environmental Update" | "International Relations" | "Human Interest Story" | "Opinion Piece" | "Editorial" | "Analysis" | "Prediction" | "Celebration" | "Award" | "Conference" | "Research Finding" | "Crime" | "Trial/Court Case" | "Entertainment Update" | "Product Launch" | "Scientific Discovery" | "Travel Advisory" | "Weather Report" | "Policy Change" | "Protest" | "Elections" | "Obituary" | "Reunion" | "Award Nomination" | "Fraud" | "Cybersecurity Incident" | "Space Exploration" | "Charity Event"
    }
    `;
    
        // 5) OpenAI 클라이언트 생성
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API,
        });
    
        // 6) ChatGPT(정확히는 gpt-4o 계열)에게 Structured Outputs로 요청
        //    - 여기서는 예시로 gpt-4o-2024-08-06 모델 사용
        //    - `json_schema`에 “출력해야 할 스키마”를 정의
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-2024-08-06", // 또는 gpt-4o-mini-2024-07-18 등
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that outputs strict JSON adhering to the provided schema.",
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              // 이름(임의로 지정 가능)
              name: "selected_news",
              strict: true,
              // 실제 JSON 스키마 정의
              schema: {
                type: "object",
                properties: {
                  coinName:{
                    type:"string",
                    description: "Use provocative, attention-grabbing phrases. Organize the content of the news into one characteristic word, and give it a unique name.",
                  },
                  title: {
                    type: "string",
                    description: "The news title",
                  },
                  keyWord: {
                    type: "string",
                    description: "extract the key word. The subject of the news, the institution, or the object of the event, the subject, or the subject. ",
                  },
                  description: {
                    type: "string",
                    description: "the details of the news",
                  },
                  field: {
                    type: "string",
                    description: "One of the fixed categories",
                    enum: [
                      "Economy",
                      "Society",
                      "Culture/Artistry",
                      "The international/World",
                      "Science/Technology",
                      "Sports",
                      "Entertainment",
                      "Health/Medical care",
                      "Environment",
                      "Education",
                      "Accident",
                    ],
                  },
                  majorPeople: {
                    "type": "array",
                    "description": "An array of key people or figures mentioned in the news.",
                    "items": {
                      "type": "string",
                      "description": "Name of a person"
                    }
                  },
                  region: {
                    type: "string",
                    description: "Primary location or region",
                  },
                  eventClassification: {
                    type: "string",
                    description: "One of the fixed categories",
                    enum: [
                      "Breaking News",         // 속보
                      "Announcement",          // 공식 발표
                      "Accident",              // 사고
                      "Scandal",               // 스캔들
                      "Natural Disaster",      // 자연재해
                      "Political Development", // 정치적 발전
                      "Economic Update",       // 경제 관련 업데이트
                      "Sports Update",         // 스포츠 업데이트
                      "Cultural Event",        // 문화 행사
                      "Technological Advance", // 기술 발전
                      "Health Alert",          // 건강 관련 경고
                      "Educational News",      // 교육 관련 뉴스
                      "Environmental Update",  // 환경 관련 업데이트
                      "International Relations", // 국제 관계
                      "Human Interest Story",  // 사람 중심 이야기
                      "Opinion Piece",         // 의견/칼럼
                      "Editorial",             // 사설
                      "Analysis",              // 심층 분석
                      "Prediction",            // 예측
                      "Celebration",           // 기념일 또는 축하 이벤트
                      "Award",                 // 시상식 관련
                      "Conference",            // 회의 또는 포럼
                      "Research Finding",      // 연구 결과 발표
                      "Crime",                 // 범죄 사건
                      "Trial/Court Case",      // 재판 또는 법적 사건
                      "Entertainment Update",  // 엔터테인먼트 관련 업데이트
                      "Product Launch",        // 제품 출시
                      "Scientific Discovery",  // 과학적 발견
                      "Travel Advisory",       // 여행 경고 또는 권고
                      "Weather Report",        // 날씨 보고
                      "Policy Change",         // 정책 변경
                      "Protest",               // 시위 또는 집회
                      "Elections",             // 선거 관련
                      "Obituary",              // 부고
                      "Reunion",               // 재결합 또는 모임
                      "Award Nomination",      // 시상식 후보 발표
                      "Fraud",                 // 사기 사건
                      "Cybersecurity Incident", // 사이버보안 사고
                      "Space Exploration",     // 우주 탐사
                      "Charity Event"          // 자선 행사
                    ],
                    
                  },
                },
                required: [
                  "coinName",
                  "keyWord",
                  "title",
                  "description",
                  "field",
                  "majorPeople",
                  "region",
                  "eventClassification",
                ],
                additionalProperties: false,
              },
            },
          },
        });
    
        // 7) 응답에서 구조화된 결과 가져오기
        const choice = completion.choices?.[0]?.message;
    
        // - 모델이 “refusal”을 반환할 수도 있으므로 확인
        if (choice?.refusal) {
            console.error("OpenAI refusal:", choice.refusal);
            return null;
          }
        // - 정상이라면 `parsed` 필드에 스키마 준수 데이터가 있음
        //   (SDK 버전에 따라 `message.parsed` 또는 `message.content`일 수 있음)
        
    const parsedData = JSON.parse(choice?.content || "{}");
    const result = parsedData.result ? JSON.parse(parsedData.result) : parsedData;

    // CoinNews 데이터 가공
    const coin: Coin = {
      coinName: result.coinName,
      title: result.title,
      keyWord:result.keyWord,
      description: result.description,
      field: result.field,
      majorPeople: result.majorPeople || [],
      region: result.region,
      eventClassification: result.eventClassification,
      createdAt: new Date(), // 현재 시간
      viewCount:0,
      price:0,
    };

    return coin;
      } catch (err) {
        console.error("Error in getCoinNewsText:", err);
        return null;
      }
}
// S3 Client 설정
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY || "",
      secretAccessKey: process.env.AWS_SECRET_KEY || "",
    },
  });
  
async function insertCoinImageUrl(cn:Coin):Promise<Coin|null>{
try {
  if (process.env.NODE_ENV === "development") {
    console.log("Mocking OpenAI API response.");
    const imgUrl= "https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=2166&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    const client = await connectDB;
    const db = client.db("postings");

    const newCoin: Coin = {
      ...cn,
      imgUrl, // 이미지 URL 추가
      createdAt: new Date(),
    };

    const result = await db.collection<Coin>("coins").insertOne(newCoin);
  // 2) _id 필드 추가하여 CoinNews 타입 데이터 생성
  const savedNews: Coin = {
    ...newCoin,
    _id: result.insertedId, // MongoDB에서 생성된 _id 추가
  };
    // 9) 최종 응답
    return savedNews
  }


    const { coinName, title } = cn;
    if (!coinName || !title) {
      throw new Error("coinName and title are required in Coin data");
    }
    const prompt = `Create a digital art image representing and contaion word "${coinName}", and it maybe attention-grabbing image.`;

    // 4) DALL·E 통해 base64 이미지 생성
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      response_format: "b64_json",
      n: 1,
      size: "1024x1024",
    });

    const imageBase64 = dalleResponse.data[0]?.b64_json;
    if (!imageBase64) {
        throw new Error("Failed to generate image from OpenAI");
      }

    // 5) Base64 → Buffer 변환
    const fileBuffer = Buffer.from(imageBase64, "base64");

    // 6) S3 업로드
    const bucketName = process.env.S3_BUCKET_NAME as string;
    const fileName = `dalle-coin-${Date.now()}.png`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: "image/png",
      })
    );

    // 7) S3 URL 생성
    const imgUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // 8) MongoDB 저장
    //    - coinData에 imgUrl, createdAt 추가
    const client = await connectDB;
    const db = client.db("postings");

    const newCoin: Coin = {
      ...cn,
      imgUrl, // 이미지 URL 추가
      createdAt: new Date(),
    };

    const result = await db.collection<Coin>("coins").insertOne(newCoin);
  // 2) _id 필드 추가하여 CoinNews 타입 데이터 생성
  const savedNews: Coin = {
    ...newCoin,
    _id: result.insertedId, // MongoDB에서 생성된 _id 추가
  };
    // 9) 최종 응답
    return savedNews
  } catch (err) {
    console.error("Error in getAiImageUrl:", err);
    return null;
  }
}
