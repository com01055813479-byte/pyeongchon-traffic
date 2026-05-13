import type { TimeSlot } from "@/lib/types";

// 학원가 주요 시간대 (30분 단위)
export const TIME_SLOTS: TimeSlot[] = [
  { id: "s1", label: "오전 9시", start: "09:00", end: "09:30", isRushHour: false },
  { id: "s2", label: "오전 9시 30분", start: "09:30", end: "10:00", isRushHour: false },
  { id: "s3", label: "오전 10시", start: "10:00", end: "10:30", isRushHour: false },
  { id: "s4", label: "오전 10시 30분", start: "10:30", end: "11:00", isRushHour: false },
  { id: "s5", label: "오전 11시", start: "11:00", end: "11:30", isRushHour: false },
  { id: "s6", label: "오전 11시 30분", start: "11:30", end: "12:00", isRushHour: false },
  { id: "s7", label: "오후 12시", start: "12:00", end: "12:30", isRushHour: false },
  { id: "s8", label: "오후 12시 30분", start: "12:30", end: "13:00", isRushHour: false },
  { id: "s9", label: "오후 1시", start: "13:00", end: "13:30", isRushHour: false },
  { id: "s10", label: "오후 1시 30분", start: "13:30", end: "14:00", isRushHour: false },
  { id: "s11", label: "오후 2시", start: "14:00", end: "14:30", isRushHour: false },
  { id: "s12", label: "오후 2시 30분", start: "14:30", end: "15:00", isRushHour: false },
  { id: "s13", label: "오후 3시", start: "15:00", end: "15:30", isRushHour: false },
  { id: "s14", label: "오후 3시 30분", start: "15:30", end: "16:00", isRushHour: false },
  { id: "s15", label: "오후 4시", start: "16:00", end: "16:30", isRushHour: true },
  { id: "s16", label: "오후 4시 30분", start: "16:30", end: "17:00", isRushHour: true },
  { id: "s17", label: "오후 5시", start: "17:00", end: "17:30", isRushHour: true },
  { id: "s18", label: "오후 5시 30분", start: "17:30", end: "18:00", isRushHour: true },
  { id: "s19", label: "오후 6시", start: "18:00", end: "18:30", isRushHour: true },
  { id: "s20", label: "오후 6시 30분", start: "18:30", end: "19:00", isRushHour: true },
  { id: "s21", label: "오후 7시", start: "19:00", end: "19:30", isRushHour: true },
  { id: "s22", label: "오후 7시 30분", start: "19:30", end: "20:00", isRushHour: true },
  { id: "s23", label: "오후 8시", start: "20:00", end: "20:30", isRushHour: true },
  { id: "s24", label: "오후 8시 30분", start: "20:30", end: "21:00", isRushHour: false },
  { id: "s25", label: "오후 9시", start: "21:00", end: "21:30", isRushHour: false },
  { id: "s26", label: "오후 9시 30분", start: "21:30", end: "22:00", isRushHour: false },
  { id: "s27", label: "오후 10시", start: "22:00", end: "22:30", isRushHour: false },
];

export const TIME_SLOT_MAP = Object.fromEntries(TIME_SLOTS.map((t) => [t.id, t]));
