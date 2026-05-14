"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Car,
  ClipboardList,
  BarChart3,
  MapPin,
  ArrowRight,
  AlertCircle,
  CalendarDays,
  Star,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardSummary } from "@/components/features/recommendation/DashboardSummary";
import { TodayScheduleCard } from "@/components/features/schedule/TodayScheduleCard";
import { LocationTracker } from "@/components/features/gps/LocationTracker";
import { TravelTimeEstimate } from "@/components/features/gps/TravelTimeEstimate";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { SAMPLE_RECORDS, SAMPLE_SCHEDULES } from "@/data/sampleData";
import { buildPickupRecommendations, getSchedulePickupInfo } from "@/lib/algorithms/congestionScore";
import { AREAS } from "@/lib/constants/areas";
import { useSettings } from "@/lib/context/SettingsContext";
import type { DashboardStats, AcademySchedule, DayOfWeek, UserLocation } from "@/lib/types";

const KO_DAYS: DayOfWeek[] = ["일", "월", "화", "수", "목", "금", "토"];

function calcStats(areaId: string, rushMultiplier: number): DashboardStats {
  const recs = buildPickupRecommendations(SAMPLE_RECORDS, areaId, rushMultiplier).filter(
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

const FEATURE_CARDS = [
  {
    href: "/schedule",
    icon: CalendarDays,
    accent: "from-indigo-400 to-violet-600",
    title: "학원 시간표",
    desc: "수업 종료 시간 등록 및 픽업 안내",
  },
  {
    href: "/data-input",
    icon: ClipboardList,
    accent: "from-blue-400 to-sky-600",
    title: "현장 조사",
    desc: "시간대별 차량 수 데이터 입력",
  },
  {
    href: "/analysis",
    icon: BarChart3,
    accent: "from-fuchsia-400 to-purple-600",
    title: "혼잡도 분석",
    desc: "데이터 기반 차트 시각화",
  },
  {
    href: "/settings",
    icon: Settings,
    accent: "from-slate-400 to-slate-700",
    title: "설정",
    desc: "테마, 데이터, 가중치 조정",
  },
];

export default function HomePage() {
  const { settings, hydrated } = useSettings();
  const [schedules] = useLocalStorage<AcademySchedule[]>("academy-schedules", SAMPLE_SCHEDULES);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const todayDay = KO_DAYS[new Date().getDay()];
  const areaId = hydrated ? settings.defaultAreaId : AREAS[0].id;
  const rushMult = hydrated ? settings.rushHourMultiplier : 1.15;
  const stats = calcStats(areaId, rushMult);

  const todayInfos = schedules
    .filter((s) => s.days.includes(todayDay))
    .sort((a, b) => a.endTime.localeCompare(b.endTime))
    .map((s) => getSchedulePickupInfo(s, SAMPLE_RECORDS, rushMult));

  return (
    <div className="flex flex-col gap-6">
      {/* 히어로 — 컴팩트 */}
      <section className="glass rounded-3xl px-6 py-7 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Car size={18} className="text-white" />
            </div>
            <Badge variant="outline" className="text-slate-700 dark:text-slate-200">학교 동아리 프로젝트</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            평촌학원가 차량 혼잡도 분석
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            학원 시간표를 등록하면 수업 종료 시각의 혼잡도를 분석해 최적의 픽업 타이밍을 안내합니다.
          </p>
        </div>
      </section>

      {/* 지도 + 위치 — 메인 컨텐츠 */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-500 dark:text-blue-400" />
              내 위치 → 학원가 소요 시간
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LocationTracker onLocation={setUserLocation} />
          <TravelTimeEstimate userLocation={userLocation} />
        </CardContent>
      </Card>

      {/* 통계 */}
      <DashboardSummary stats={stats} />

      {/* 오늘의 픽업 일정 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-500 dark:text-indigo-300" />
                오늘({todayDay}요일) 픽업 일정
              </span>
            </CardTitle>
            <Link href="/schedule" className="text-xs text-blue-500 dark:text-blue-300 hover:underline font-medium">
              시간표 관리 →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayInfos.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
              <Star size={28} className="mx-auto mb-2 opacity-40" />
              <p>오늘({todayDay}) 등록된 학원 일정이 없습니다.</p>
              <Link href="/schedule" className="text-blue-500 dark:text-blue-300 hover:underline text-xs mt-1 block">
                시간표 탭에서 학원을 추가해 주세요 →
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

      {/* 샘플 데이터 안내 */}
      <div className="glass rounded-2xl px-4 py-3 flex items-start gap-2 text-sm">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
        <p className="text-slate-700 dark:text-slate-200">
          현재는 <strong>샘플 데이터</strong>로 동작합니다. 실제 조사 후{" "}
          <Link href="/data-input" className="underline font-medium text-blue-600 dark:text-blue-300">데이터 입력</Link>에서
          추가하고{" "}
          <Link href="/schedule" className="underline font-medium text-blue-600 dark:text-blue-300">시간표</Link>를
          등록해 주세요.
        </p>
      </div>

      {/* 기능 바로가기 */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1">기능 바로가기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURE_CARDS.map((f) => (
            <Link key={f.href} href={f.href}>
              <div className="glass rounded-2xl p-4 hover:scale-[1.02] transition-transform h-full group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-3 shadow-lg`}>
                  <f.icon size={18} className="text-white drop-shadow" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">{f.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed hidden sm:block">{f.desc}</p>
                <div className="flex items-center gap-1 text-blue-500 dark:text-blue-300 text-xs font-medium mt-2 group-hover:gap-2 transition-all">
                  바로가기 <ArrowRight size={11} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
