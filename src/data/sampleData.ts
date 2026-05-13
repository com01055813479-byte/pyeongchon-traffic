import type { SurveyRecord } from "@/lib/types";
import type { AcademySchedule } from "@/lib/types";

// 현장 조사 샘플 데이터 (실제 조사 후 교체 예정)
// ※ beomsye-intersection 구역 제거됨
export const SAMPLE_RECORDS: SurveyRecord[] = [
  // 2025-05-01 조사 — 평촌학원가 중앙로
  { id: "1",  date: "2025-05-01", timeSlot: "14:00", areaId: "pyeongchon-main", carCount: 12, weather: "맑음", createdAt: "2025-05-01T14:05:00Z" },
  { id: "2",  date: "2025-05-01", timeSlot: "15:00", areaId: "pyeongchon-main", carCount: 25, weather: "맑음", createdAt: "2025-05-01T15:05:00Z" },
  { id: "3",  date: "2025-05-01", timeSlot: "16:00", areaId: "pyeongchon-main", carCount: 52, weather: "맑음", createdAt: "2025-05-01T16:05:00Z" },
  { id: "4",  date: "2025-05-01", timeSlot: "17:00", areaId: "pyeongchon-main", carCount: 71, weather: "맑음", createdAt: "2025-05-01T17:05:00Z" },
  { id: "5",  date: "2025-05-01", timeSlot: "18:00", areaId: "pyeongchon-main", carCount: 78, weather: "맑음", createdAt: "2025-05-01T18:05:00Z" },
  { id: "6",  date: "2025-05-01", timeSlot: "19:00", areaId: "pyeongchon-main", carCount: 65, weather: "맑음", createdAt: "2025-05-01T19:05:00Z" },
  { id: "7",  date: "2025-05-01", timeSlot: "20:00", areaId: "pyeongchon-main", carCount: 48, weather: "맑음", createdAt: "2025-05-01T20:05:00Z" },
  { id: "8",  date: "2025-05-01", timeSlot: "21:00", areaId: "pyeongchon-main", carCount: 20, weather: "맑음", createdAt: "2025-05-01T21:05:00Z" },

  // 2025-05-01 조사 — 평촌학원가 북쪽
  { id: "13", date: "2025-05-01", timeSlot: "15:00", areaId: "pyeongchon-north", carCount: 18, weather: "맑음", createdAt: "2025-05-01T15:10:00Z" },
  { id: "14", date: "2025-05-01", timeSlot: "16:00", areaId: "pyeongchon-north", carCount: 40, weather: "맑음", createdAt: "2025-05-01T16:10:00Z" },
  { id: "15", date: "2025-05-01", timeSlot: "17:00", areaId: "pyeongchon-north", carCount: 55, weather: "맑음", createdAt: "2025-05-01T17:10:00Z" },
  { id: "16", date: "2025-05-01", timeSlot: "18:00", areaId: "pyeongchon-north", carCount: 58, weather: "맑음", createdAt: "2025-05-01T18:10:00Z" },

  // 2025-05-02 조사 — 평촌학원가 중앙로 (흐림/비)
  { id: "17", date: "2025-05-02", timeSlot: "14:00", areaId: "pyeongchon-main", carCount: 10, weather: "흐림", createdAt: "2025-05-02T14:05:00Z" },
  { id: "18", date: "2025-05-02", timeSlot: "17:00", areaId: "pyeongchon-main", carCount: 68, weather: "흐림", createdAt: "2025-05-02T17:05:00Z" },
  { id: "19", date: "2025-05-02", timeSlot: "18:00", areaId: "pyeongchon-main", carCount: 75, weather: "비",  createdAt: "2025-05-02T18:05:00Z" },
  { id: "20", date: "2025-05-02", timeSlot: "19:00", areaId: "pyeongchon-main", carCount: 80, weather: "비",  createdAt: "2025-05-02T19:05:00Z" },
];

// 학원 시간표 샘플 데이터 (사용자가 시간표 탭에서 수정 가능)
export const SAMPLE_SCHEDULES: AcademySchedule[] = [
  {
    id: "sch1",
    academyName: "수학 학원",
    days: ["월", "수", "금"],
    endTime: "20:00",
    areaId: "pyeongchon-main",
    note: "3층 강의실 앞 픽업",
  },
  {
    id: "sch2",
    academyName: "영어 학원",
    days: ["화", "목"],
    endTime: "19:00",
    areaId: "pyeongchon-north",
    note: "",
  },
];
