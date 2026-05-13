// ─── 현장 조사 ────────────────────────────────────────────────────────────────

// 시간대별 현장 조사 데이터
export interface SurveyRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  timeSlot: string;       // HH:MM 형식 (ex: "14:00")
  areaId: string;
  carCount: number;
  weather: WeatherCondition;
  note?: string;
  createdAt: string;
}

export type WeatherCondition = "맑음" | "흐림" | "비" | "눈";

// ─── 혼잡도 ───────────────────────────────────────────────────────────────────

// 혼잡도 점수 (0~100)
export interface CongestionScore {
  score: number;
  level: CongestionLevel;
  label: string;
  color: string;
}

export type CongestionLevel = "원활" | "보통" | "혼잡" | "매우혼잡";

// ─── 지역 구역 ────────────────────────────────────────────────────────────────

export interface Area {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  maxCapacity: number;    // 해당 구역 최대 허용 차량 수 기준
}

// ─── 시간대 ───────────────────────────────────────────────────────────────────

export interface TimeSlot {
  id: string;
  label: string;          // "오후 2시"
  start: string;          // "14:00"
  end: string;            // "14:30"
  isRushHour: boolean;
}

// ─── 학원 시간표 ──────────────────────────────────────────────────────────────

export type DayOfWeek = "월" | "화" | "수" | "목" | "금" | "토" | "일";

export interface AcademySchedule {
  id: string;
  academyName: string;    // "수학 학원"
  days: DayOfWeek[];      // 수업 요일 ["월", "수", "금"]
  endTime: string;        // 수업 종료 시간 "HH:MM" ex) "20:00"
  areaId: string;         // 학원이 위치한 구역
  note?: string;          // 픽업 장소 등 메모
}

// 시간표 기반 픽업 추천 결과
export interface SchedulePickupInfo {
  schedule: AcademySchedule;
  congestion: CongestionScore;
  expectedCarCount: number;
  suggestedArrivalText: string;  // "수업 끝나기 10분 전 도착 권장"
}

// ─── GPS / 소요시간 ───────────────────────────────────────────────────────────

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface TravelTimeResult {
  durationSeconds: number;
  durationText: string;   // "약 12분"
  distance: number;       // 미터
  distanceText: string;   // "3.2km"
}

// ─── 픽업 추천 (일반) ─────────────────────────────────────────────────────────

export interface PickupRecommendation {
  timeSlot: TimeSlot;
  score: CongestionScore;
  expectedCarCount: number;
  isRecommended: boolean;
  reason: string;
}

// ─── 대시보드 통계 ────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalSurveys: number;
  avgCongestionScore: number;
  bestPickupSlot: TimeSlot | null;
  worstPickupSlot: TimeSlot | null;
  todayRecords: SurveyRecord[];
}
