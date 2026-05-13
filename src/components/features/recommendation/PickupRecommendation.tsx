"use client";

import { useState } from "react";
import { AREAS } from "@/lib/constants/areas";
import { buildPickupRecommendations } from "@/lib/algorithms/congestionScore";
import type { SurveyRecord } from "@/lib/types";
import { OptimalTimeCard } from "./OptimalTimeCard";
import { Star } from "lucide-react";

interface Props {
  records: SurveyRecord[];
}

export function PickupRecommendationPanel({ records }: Props) {
  const [areaId, setAreaId] = useState(AREAS[0].id);

  const recommendations = buildPickupRecommendations(records, areaId);
  const best = recommendations
    .filter((r) => r.expectedCarCount > 0)
    .sort((a, b) => a.score.score - b.score.score)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      {/* 구역 선택 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">분석 구역</label>
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        >
          {AREAS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* 추천 시간대 */}
      {best.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          <Star size={32} className="mx-auto mb-2 opacity-30" />
          <p>아직 분석할 데이터가 없습니다.</p>
          <p className="text-xs mt-1">데이터 입력 탭에서 현장 조사 데이터를 추가해 주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {best.map((rec, i) => (
            <OptimalTimeCard key={rec.timeSlot.id} recommendation={rec} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
