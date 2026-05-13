"use client";

import { CalendarDays, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScheduleForm } from "@/components/features/schedule/ScheduleForm";
import { ScheduleList } from "@/components/features/schedule/ScheduleList";
import { TodayScheduleCard } from "@/components/features/schedule/TodayScheduleCard";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { getSchedulePickupInfo } from "@/lib/algorithms/congestionScore";
import { SAMPLE_RECORDS, SAMPLE_SCHEDULES } from "@/data/sampleData";
import type { AcademySchedule, DayOfWeek } from "@/lib/types";

const KO_DAYS: DayOfWeek[] = ["일", "월", "화", "수", "목", "금", "토"];

function getTodayDay(): DayOfWeek {
  return KO_DAYS[new Date().getDay()];
}

export default function SchedulePage() {
  const [schedules, setSchedules, hydrated] = useLocalStorage<AcademySchedule[]>(
    "academy-schedules",
    SAMPLE_SCHEDULES
  );

  const todayDay = getTodayDay();

  // 오늘 요일에 해당하는 학원만 필터
  const todaySchedules = schedules.filter((s) => s.days.includes(todayDay));

  // 오늘 학원별 픽업 추천 정보 계산
  const todayInfos = todaySchedules
    .sort((a, b) => a.endTime.localeCompare(b.endTime))
    .map((s) => getSchedulePickupInfo(s, SAMPLE_RECORDS));

  function handleAdd(data: Omit<AcademySchedule, "id">) {
    setSchedules((prev) => [
      ...prev,
      { ...data, id: `sch-${Date.now()}` },
    ]);
  }

  function handleDelete(id: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <CalendarDays size={20} className="text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">학원 시간표</h1>
          <p className="text-sm text-gray-500">
            학원 수업 종료 시간을 등록하면 픽업 혼잡도를 자동으로 안내합니다
          </p>
        </div>
      </div>

      {/* 오늘의 픽업 일정 */}
      <Card>
        <CardHeader>
          <CardTitle>
            오늘({todayDay}요일) 픽업 일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hydrated ? (
            <p className="text-sm text-gray-400 py-4 text-center">불러오는 중...</p>
          ) : todayInfos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Star size={28} className="mx-auto mb-2 opacity-30" />
              <p>오늘({todayDay}) 등록된 학원 일정이 없습니다.</p>
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

      {/* 시간표 추가 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 학원 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm onAdd={handleAdd} />
        </CardContent>
      </Card>

      {/* 전체 시간표 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 시간표 ({schedules.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {!hydrated ? (
            <p className="text-sm text-gray-400 py-4 text-center">불러오는 중...</p>
          ) : (
            <ScheduleList
              schedules={schedules}
              onDelete={handleDelete}
              todayDay={todayDay}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
