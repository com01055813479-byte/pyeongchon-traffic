"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClipboardList,
  BarChart3,
  MapPin,
  ChevronRight,
  AlertCircle,
  CalendarDays,
  Star,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
  { href: "/schedule",   icon: CalendarDays,   title: "학원 시간표", desc: "수업 종료 시간 등록" },
  { href: "/data-input", icon: ClipboardList,  title: "현장 조사",    desc: "차량 수 데이터 입력" },
  { href: "/analysis",   icon: BarChart3,      title: "혼잡도 분석",  desc: "시간대별 차트" },
  { href: "/settings",   icon: Settings,       title: "설정",         desc: "테마, 데이터, 가중치" },
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
    <div className="flex flex-col gap-5">
      {/* ─── 인사말 (히어로 대체) ─────────────────────────────────────────── */}
      <section className="pt-2 pb-1">
        <p className="text-sm text-[var(--text-muted)] mb-1">오늘 {todayDay}요일</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-strong)] leading-tight">
          평촌학원가
          <br />
          <span className="text-[var(--accent)]">픽업 안내</span>
        </h1>
      </section>

      {/* ─── 지도 + 위치 — 메인 컨텐츠 ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--accent)]" />
              내 위치 → 학원가
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LocationTracker onLocation={setUserLocation} />
          <TravelTimeEstimate
            userLocation={userLocation}
            onOverrideLocation={(loc) => setUserLocation(loc)}
          />
        </CardContent>
      </Card>

      {/* ─── 오늘의 픽업 일정 ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[var(--accent)]" />
                오늘의 픽업
              </span>
            </CardTitle>
            <Link
              href="/schedule"
              className="text-xs font-semibold text-[var(--accent-text)] hover:underline"
            >
              시간표 관리
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayInfos.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">
              <Star size={28} className="mx-auto mb-2 opacity-30" />
              <p className="mb-1">오늘 등록된 학원 일정이 없어요</p>
              <Link href="/schedule" className="text-[var(--accent-text)] text-xs font-semibold hover:underline">
                시간표 추가하기 →
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

      {/* ─── 통계 요약 ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold text-[var(--text-strong)] mb-2 px-1">현황 요약</h2>
        <DashboardSummary stats={stats} />
      </section>

      {/* ─── 샘플 데이터 안내 ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-4 py-3 flex items-start gap-2 text-sm"
        style={{
          backgroundColor: "var(--bg-soft)",
          color: "var(--text-base)",
        }}
      >
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        <p>
          현재 <strong>샘플 데이터</strong>로 동작합니다.{" "}
          <Link href="/data-input" className="text-[var(--accent-text)] font-semibold hover:underline">
            데이터 입력
          </Link>
          {" / "}
          <Link href="/schedule" className="text-[var(--accent-text)] font-semibold hover:underline">
            시간표
          </Link>
          를 추가해 주세요.
        </p>
      </div>

      {/* ─── 기능 바로가기 (리스트 스타일) ───────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold text-[var(--text-strong)] mb-2 px-1">바로가기</h2>
        <Card className="!p-0 overflow-hidden">
          {FEATURE_CARDS.map((f, idx) => (
            <Link
              key={f.href}
              href={f.href}
              className={`flex items-center gap-3 px-5 py-4 hover:bg-[var(--bg-soft)] transition-colors ${
                idx > 0 ? "border-t border-[var(--border)]" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                <f.icon size={18} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-strong)]">{f.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{f.desc}</p>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)] shrink-0" />
            </Link>
          ))}
        </Card>
      </section>
    </div>
  );
}
