"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CongestionChart } from "@/components/features/congestion/CongestionChart";
import { TimeSlotGrid } from "@/components/features/congestion/TimeSlotGrid";
import { SAMPLE_RECORDS } from "@/data/sampleData";
import { AREAS } from "@/lib/constants/areas";
import { buildPickupRecommendations } from "@/lib/algorithms/congestionScore";
import { useSettings } from "@/lib/context/SettingsContext";

const TIME_RANGES = [
  { label: "전체", from: "09:00", to: "22:30" },
  { label: "오전 (9~12시)", from: "09:00", to: "12:00" },
  { label: "오후 (12~18시)", from: "12:00", to: "18:00" },
  { label: "저녁 (18~22시)", from: "18:00", to: "22:30" },
];

export default function AnalysisPage() {
  const { settings, hydrated } = useSettings();
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const [rangeIdx, setRangeIdx] = useState(0);

  const rushMult = hydrated ? settings.rushHourMultiplier : 1.15;
  const recommendations = buildPickupRecommendations(SAMPLE_RECORDS, areaId, rushMult);
  const range = TIME_RANGES[rangeIdx];

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="pt-2 pb-1">
        <p className="text-sm text-[var(--text-muted)] mb-1 flex items-center gap-1.5">
          <BarChart3 size={14} />
          분석
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)] leading-tight">
          시간대별 혼잡도
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          조사 데이터를 기반으로 시간대별 패턴을 분석합니다.
        </p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--text-base)]">구역</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="input rounded-xl px-3 py-2 text-sm"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {TIME_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                rangeIdx === i
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-soft)] text-[var(--text-base)] hover:bg-[var(--border)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 바 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>시간대별 혼잡도 막대 차트</CardTitle>
        </CardHeader>
        <CardContent>
          <CongestionChart recommendations={recommendations} filter={range} />
        </CardContent>
      </Card>

      {/* 그리드 뷰 */}
      <Card>
        <CardHeader>
          <CardTitle>시간대별 혼잡도 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSlotGrid
            recommendations={recommendations.filter(
              (r) =>
                r.timeSlot.start >= range.from &&
                r.timeSlot.start <= range.to
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
