import { NextResponse } from 'next/server';
import { CreateCoin } from '../createAiCoin/route';

// 0.01시간 = 360초 (테스트용)
const TIMER_INTERVAL_HOURS = 1;
const TIMER_INTERVAL_MS = TIMER_INTERVAL_HOURS * 60 * 60 * 1000;

// 남은 시간 계산용
let countdownEndTime: number | null = null;

// (1) 타이머를 현재 시각 + 36초로 재설정
function resetTimer() {
  countdownEndTime = Date.now() + TIMER_INTERVAL_MS;
  console.log(`[resetTimer] Timer reset to end at: ${new Date(countdownEndTime).toISOString()}`);
}

// (2) 실제 작업 함수
async function performTask() {
  console.log('[performTask] Starting DB job...');

  let isOk = await CreateCoin();
  let count = 0;
  while (count <= 3) {
    if (!isOk) {
      isOk = await CreateCoin();
      count++;
      continue;
    } else {
      break;
    }
  }

  console.log('[performTask] Completed.');
}

/**
 * (3) 정확한 36초 주기 실행 보장 로직
 *     - 현재 시간(`Date.now()`)을 기준으로 정확히 36초 후 실행
 *     - 작업 실행 시간이 걸리더라도, 다음 작업은 정확히 36초 주기로 시작
 */
async function scheduleTask() {
  const startTime = Date.now();

  try {
    // 타이머가 만료되었을 경우 작업 수행
    if (countdownEndTime && startTime >= countdownEndTime) {
      console.log(`[scheduleTask] Performing task at: ${new Date(startTime).toISOString()}`);
      await performTask();
      resetTimer(); // 타이머 재설정
    }
  } catch (err) {
    console.error('[scheduleTask] Task failed:', err);
  }

  // 다음 실행 시간 계산
  const nextExecutionTime = countdownEndTime || startTime + TIMER_INTERVAL_MS;
  const delay = Math.max(0, nextExecutionTime - Date.now());
  console.log(`[scheduleTask] Next execution scheduled in: ${delay / 1000}s`);

  // 정확히 다음 주기에 맞추기 위해 재귀 호출
  setTimeout(scheduleTask, delay);
}

// (4) 서버 시작 시 초기화 및 작업 스케줄링
if (!countdownEndTime) {
  resetTimer();
}
scheduleTask();

// (5) GET 핸들러: 남은 시간만 반환
export async function GET() {
  try {
    if (countdownEndTime === null) {
      console.log('Timer not initialized.');
      return NextResponse.json({ error: 'Timer not initialized' }, { status: 500 });
    }

    const now = Date.now();
    let timeRemaining = countdownEndTime - now;

    // 이미 시간이 지났으면 0으로 처리
    if (timeRemaining < 0) {
      timeRemaining = 0;
    }

    // 남은 시간 (ms → 시:분:초)
    const hours = Math.floor(timeRemaining / 3600000);
    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    // 전체 주기 (36초를 HH:MM:SS 형태로)
    const totalH = Math.floor(TIMER_INTERVAL_HOURS);
    const totalM = Math.floor((TIMER_INTERVAL_HOURS % 1) * 60);
    const totalS = Math.floor((((TIMER_INTERVAL_HOURS % 1) * 60) % 1) * 60);

    return NextResponse.json({
      remainingTime: `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      totalTime: `${totalH.toString().padStart(2, '0')}:${totalM
        .toString()
        .padStart(2, '0')}:${totalS.toString().padStart(2, '0')}`,
    });
  } catch (error) {
    console.error('[Timer API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch timer status' }, { status: 500 });
  }
}
