"use client";

import { useState } from "react";
import { MapPin, CalendarDays, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LocationTracker } from "@/components/features/gps/LocationTracker";
import { TravelTimeEstimate } from "@/components/features/gps/TravelTimeEstimate";
import { DashboardSummary } from "@/components/features/recommendation/DashboardSummary";
import { TodayScheduleCard } from "@/components/features/schedule/TodayScheduleCard";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { SAMPLE_RECORDS, SAMPLE_SCHEDULES } from "@/data/sampleData";
import { buildPickupRecommendations, getSchedulePickupInfo } from "@/lib/algorithms/congestionScore";
import { AREAS } from "@/lib/constants/areas";
import type { UserLocation, DashboardStats, AcademySchedule, DayOfWeek } from "@/lib/types";
import Link from "next/link";

const KO_DAYS: DayOfWeek[] = ["일", "월", "화", "수", "목", "금", "토"];

function calcStats(): DashboardStats {
  const recs = buildPickupRecommendations(SAMPLE_RECORDS, AREAS[0].id).filter(
    (r) => r.expectedCarCount > 0
  );
  const scores = recs.map((r) => r.score.score);
  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const sorted = [...recs].sort((a, b) => a.score.score - b.score.score);
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalSurveys: SAMPLE_RECORDS.length,
    avgCongestionScore: avg,
    bestPickupSlot: sorted[0]?.timeSlot ?? null,
    worstPickupSlot: sorted[sorted.length - 1]?.timeSlot ?? null,
    todayRecords: SAMPLE_RECORDS.filter((r) => r.date === today),
  };
}

export default function DashboardPage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [schedules] = useLocalStorage<AcademySchedule[]>("academy-schedules", SAMPLE_SCHEDULES);

  const todayDay = KO_DAYS[new Date().getDay()];
  const stats = calcStats();

  const todayInfos = schedules
    .filter((s) => s.days.includes(todayDay))
    .sort((a, b) => a.endTime.localeCompare(b.endTime))
    .map((s) => getSchedulePickupInfo(s, SAMPLE_RECORDS));

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <MapPin size={20} className="text-green-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">픽업 대시보드</h1>
          <p className="text-sm text-gray-500">
            오늘의 시간표 기반 픽업 안내 및 소요 시간 확인
          </p>
        </div>
      </div>

      {/* 통계 요약 */}
      <DashboardSummary stats={stats} />

      {/* 오늘의 픽업 일정 (시간표 기반) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-500" />
                오늘({todayDay}요일) 픽업 일정
              </span>
            </CardTitle>
            <Link
              href="/schedule"
              className="text-xs text-blue-500 hover:underline font-medium"
            >
              시간표 관리 →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayInfos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Star size={28} className="mx-auto mb-2 opacity-30" />
              <p>오늘({todayDay}) 등록된 학원 일정이 없습니다.</p>
              <Link href="/schedule" className="text-blue-500 hover:underline text-xs mt-1 block">
                시간표 탭에서 학원을 추가해 주세요
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayInfos.map((info) => (
                <TodayScheduleCard key={info.schedule.id} info={info} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GPS + 소요 시간 */}
      <Card>
        <CardHeader>
          <CardTitle>내 위치 → 학원가 소요 시간</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LocationTracker onLocation={setUserLocation} />
          <TravelTimeEstimate userLocation={userLocation} />
        </CardContent>
      </Card>
    </div>
  );
}
