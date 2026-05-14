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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">혼잡도 차트 분석</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            시간대별 혼잡도 점수를 비교하고 패턴을 파악합니다
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">구역 선택</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id} className="bg-white dark:bg-slate-800">
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {TIME_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                rangeIdx === i
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-md shadow-blue-500/20"
                  : "glass text-slate-700 dark:text-slate-200 hover:scale-[1.02]"
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
