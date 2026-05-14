"use client";

import { CalendarDays, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScheduleForm } from "@/components/features/schedule/ScheduleForm";
import { ScheduleList } from "@/components/features/schedule/ScheduleList";
import { TodayScheduleCard } from "@/components/features/schedule/TodayScheduleCard";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { getSchedulePickupInfo } from "@/lib/algorithms/congestionScore";
import { SAMPLE_RECORDS, SAMPLE_SCHEDULES } from "@/data/sampleData";
import { useSettings } from "@/lib/context/SettingsContext";
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
  const { settings } = useSettings();

  const todayDay = getTodayDay();
  const todaySchedules = schedules.filter((s) => s.days.includes(todayDay));

  const todayInfos = todaySchedules
    .sort((a, b) => a.endTime.localeCompare(b.endTime))
    .map((s) => getSchedulePickupInfo(s, SAMPLE_RECORDS, settings.rushHourMultiplier));

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
      <div className="pt-2 pb-1">
        <p className="text-sm text-[var(--text-muted)] mb-1 flex items-center gap-1.5">
          <CalendarDays size={14} />
          시간표
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)] leading-tight">
          학원 수업 시간을<br/>등록해 주세요
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          수업 종료 시간에 맞춰 픽업 혼잡도를 자동으로 안내합니다.
        </p>
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
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">불러오는 중...</p>
          ) : todayInfos.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
              <Star size={28} className="mx-auto mb-2 opacity-40" />
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
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">불러오는 중...</p>
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
