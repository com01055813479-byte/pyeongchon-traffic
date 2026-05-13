"use client";

import Link from "next/link";
import {
  Car,
  ClipboardList,
  BarChart3,
  MapPin,
  ArrowRight,
  AlertCircle,
  CalendarDays,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardSummary } from "@/components/features/recommendation/DashboardSummary";
import { TodayScheduleCard } from "@/components/features/schedule/TodayScheduleCard";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { SAMPLE_RECORDS, SAMPLE_SCHEDULES } from "@/data/sampleData";
import { buildPickupRecommendations, getSchedulePickupInfo } from "@/lib/algorithms/congestionScore";
import { AREAS } from "@/lib/constants/areas";
import type { DashboardStats, AcademySchedule, DayOfWeek } from "@/lib/types";

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

const FEATURE_CARDS = [
  {
    href: "/schedule",
    icon: CalendarDays,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    title: "학원 시간표",
    desc: "학원 수업 종료 시간을 등록하고 오늘의 픽업 혼잡도를 확인합니다.",
  },
  {
    href: "/data-input",
    icon: ClipboardList,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "현장 조사 데이터",
    desc: "시간대별 차량 수 현장 조사 데이터를 입력하고 관리합니다.",
  },
  {
    href: "/analysis",
    icon: BarChart3,
    color: "text-purple-500",
    bg: "bg-purple-50",
    title: "혼잡도 차트 분석",
    desc: "입력된 데이터를 기반으로 시간대별 혼잡도를 시각화합니다.",
  },
  {
    href: "/dashboard",
    icon: MapPin,
    color: "text-green-500",
    bg: "bg-green-50",
    title: "픽업 대시보드",
    desc: "오늘 시간표 기반 픽업 안내 및 학원가까지의 소요 시간을 확인합니다.",
  },
];

export default function HomePage() {
  const [schedules] = useLocalStorage<AcademySchedule[]>("academy-schedules", SAMPLE_SCHEDULES);

  const todayDay = KO_DAYS[new Date().getDay()];
  const stats = calcStats();

  const todayInfos = schedules
    .filter((s) => s.days.includes(todayDay))
    .sort((a, b) => a.endTime.localeCompare(b.endTime))
    .map((s) => getSchedulePickupInfo(s, SAMPLE_RECORDS));

  return (
    <div className="flex flex-col gap-6">
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl px-6 py-10 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Car size={28} />
          <Badge className="bg-blue-500/60 text-white border-blue-400/50">학교 동아리 프로젝트</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          평촌학원가 차량 혼잡도 분석
        </h1>
        <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl">
          학원 시간표를 등록하면 수업 종료 시각의 혼잡도를 자동으로 분석해
          최적의 픽업 타이밍을 안내합니다.
        </p>
      </section>

      {/* 샘플 데이터 안내 배너 */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <p>
          현재는 <strong>샘플 데이터</strong>로 동작합니다.
          실제 현장 조사 후{" "}
          <Link href="/data-input" className="underline font-medium">데이터 입력</Link>에서
          추가하고,{" "}
          <Link href="/schedule" className="underline font-medium">시간표</Link>에서
          학원 일정을 등록해 주세요.
        </p>
      </div>

      {/* 요약 통계 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">전체 현황 요약</h2>
        <DashboardSummary stats={stats} />
      </section>

      {/* 오늘의 픽업 일정 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-500" />
                오늘({todayDay}요일) 픽업 일정
              </span>
            </CardTitle>
            <Link href="/schedule" className="text-xs text-blue-500 hover:underline font-medium">
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

      {/* 기능 바로가기 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">기능 바로가기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURE_CARDS.map((f) => (
            <Link key={f.href} href={f.href}>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all group h-full">
                <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon size={18} className={f.color} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed hidden sm:block">{f.desc}</p>
                <div className="flex items-center gap-1 text-blue-500 text-xs font-medium mt-2 group-hover:gap-2 transition-all">
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
