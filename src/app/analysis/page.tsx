"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CongestionChart } from "@/components/features/congestion/CongestionChart";
import { TimeSlotGrid } from "@/components/features/congestion/TimeSlotGrid";
import { SAMPLE_RECORDS } from "@/data/sampleData";
import { AREAS } from "@/lib/constants/areas";
import { buildPickupRecommendations } from "@/lib/algorithms/congestionScore";

const TIME_RANGES = [
  { label: "전체", from: "09:00", to: "22:30" },
  { label: "오전 (9~12시)", from: "09:00", to: "12:00" },
  { label: "오후 (12~18시)", from: "12:00", to: "18:00" },
  { label: "저녁 (18~22시)", from: "18:00", to: "22:30" },
];

export default function AnalysisPage() {
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const [rangeIdx, setRangeIdx] = useState(0);

  const recommendations = buildPickupRecommendations(SAMPLE_RECORDS, areaId);
  const range = TIME_RANGES[rangeIdx];

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <BarChart3 size={20} className="text-purple-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">혼잡도 차트 분석</h1>
          <p className="text-sm text-gray-500">
            시간대별 혼잡도 점수를 비교하고 패턴을 파악합니다
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">구역 선택</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
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
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                rangeIdx === i
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
