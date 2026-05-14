import type {
  CongestionScore,
  CongestionLevel,
  SurveyRecord,
  PickupRecommendation,
  AcademySchedule,
  SchedulePickupInfo,
} from "@/lib/types";
import { TIME_SLOTS } from "@/lib/constants/timeSlots";
import { AREA_MAP } from "@/lib/constants/areas";

const DEFAULT_RUSH_MULTIPLIER = 1.15;

// ─── 기본 혼잡도 점수 계산 ────────────────────────────────────────────────────

/**
 * 차량 수 → 혼잡도 점수(0~100) 변환
 * - 구역별 최대 수용 차량 수를 기준으로 정규화
 * - 러시아워 시간대에는 가중치 적용 (기본 1.15, 설정에서 조절 가능)
 */
export function calcCongestionScore(
  carCount: number,
  areaId: string,
  isRushHour: boolean,
  rushMultiplier: number = DEFAULT_RUSH_MULTIPLIER
): CongestionScore {
  const area = AREA_MAP[areaId];
  const maxCap = area?.maxCapacity ?? 60;

  const ratio = Math.min(carCount / maxCap, 1.5);
  const mult = isRushHour ? rushMultiplier : 1.0;
  const raw = Math.min(Math.round(ratio * 100 * mult), 100);

  return resolveLevel(raw);
}

function resolveLevel(score: number): CongestionScore {
  let level: CongestionLevel;
  let label: string;
  let color: string;

  if (score <= 30) {
    level = "원활";
    label = "원활 — 빠른 픽업 가능";
    color = "green";
  } else if (score <= 55) {
    level = "보통";
    label = "보통 — 대기 시간 다소 발생";
    color = "yellow";
  } else if (score <= 75) {
    level = "혼잡";
    label = "혼잡 — 10분 이상 대기 예상";
    color = "orange";
  } else {
    level = "매우혼잡";
    label = "매우혼잡 — 픽업 지연 주의";
    color = "red";
  }

  return { score, level, label, color };
}

// ─── 일반 시간대별 픽업 추천 ──────────────────────────────────────────────────

export function buildPickupRecommendations(
  records: SurveyRecord[],
  targetAreaId: string,
  rushMultiplier: number = DEFAULT_RUSH_MULTIPLIER
): PickupRecommendation[] {
  const areaRecords = records.filter((r) => r.areaId === targetAreaId);

  const bySlot: Record<string, number[]> = {};
  for (const r of areaRecords) {
    if (!bySlot[r.timeSlot]) bySlot[r.timeSlot] = [];
    bySlot[r.timeSlot].push(r.carCount);
  }

  return TIME_SLOTS.map((slot) => {
    const counts = bySlot[slot.start] ?? [];
    const avgCount = counts.length
      ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)
      : 0;

    const congestion = calcCongestionScore(avgCount, targetAreaId, slot.isRushHour, rushMultiplier);

    return {
      timeSlot: slot,
      score: congestion,
      expectedCarCount: avgCount,
      isRecommended: congestion.score <= 30,
      reason:
        congestion.score <= 30
          ? "차량이 적어 빠른 픽업이 가능합니다"
          : congestion.score <= 55
          ? "보통 수준의 혼잡도입니다"
          : "차량이 많아 대기가 발생할 수 있습니다",
    };
  });
}

// ─── 시간표 기반 픽업 추천 ────────────────────────────────────────────────────

export function getSchedulePickupInfo(
  schedule: AcademySchedule,
  records: SurveyRecord[],
  rushMultiplier: number = DEFAULT_RUSH_MULTIPLIER
): SchedulePickupInfo {
  const matchedSlot =
    TIME_SLOTS.find(
      (s) => schedule.endTime >= s.start && schedule.endTime < s.end
    ) ?? TIME_SLOTS.find((s) => s.start === schedule.endTime);

  const areaRecords = records.filter((r) => r.areaId === schedule.areaId);
  const bySlot: Record<string, number[]> = {};
  for (const r of areaRecords) {
    if (!bySlot[r.timeSlot]) bySlot[r.timeSlot] = [];
    bySlot[r.timeSlot].push(r.carCount);
  }

  const slotKey = matchedSlot?.start ?? schedule.endTime;
  const counts = bySlot[slotKey] ?? [];
  const avgCount = counts.length
    ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)
    : 0;

  const congestion = calcCongestionScore(
    avgCount,
    schedule.areaId,
    matchedSlot?.isRushHour ?? false,
    rushMultiplier
  );

  let suggestedArrivalText: string;
  if (avgCount === 0) {
    suggestedArrivalText = "조사 데이터가 없어 예측이 어렵습니다";
  } else if (congestion.score <= 30) {
    suggestedArrivalText = "종료 시각에 맞춰 도착하면 충분합니다";
  } else if (congestion.score <= 55) {
    suggestedArrivalText = "종료 5분 전 도착을 권장합니다";
  } else if (congestion.score <= 75) {
    suggestedArrivalText = "종료 10분 전 도착을 권장합니다";
  } else {
    suggestedArrivalText = "종료 15~20분 전 도착을 권장합니다";
  }

  return {
    schedule,
    congestion,
    expectedCarCount: avgCount,
    suggestedArrivalText,
  };
}
