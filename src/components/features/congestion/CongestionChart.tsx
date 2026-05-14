"use client";

import { scoreToBarColor } from "@/lib/utils/formatters";
import type { PickupRecommendation } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  recommendations: PickupRecommendation[];
  /** 표시할 시간대 범위 (start 값 기준) */
  filter?: { from: string; to: string };
}

export function CongestionChart({ recommendations, filter }: Props) {
  const items = filter
    ? recommendations.filter(
        (r) => r.timeSlot.start >= filter.from && r.timeSlot.start <= filter.to
      )
    : recommendations;

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--text-muted)] text-sm">
        해당 시간대 데이터가 없습니다.
      </div>
    );
  }

  const maxScore = Math.max(...items.map((r) => r.score.score), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1.5 min-w-max h-36 pb-1 px-1">
        {items.map((rec) => {
          const height = Math.max((rec.score.score / maxScore) * 100, 4);
          return (
            <div key={rec.timeSlot.id} className="flex flex-col items-center gap-1 group">
              {/* 툴팁 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap absolute -translate-y-full">
                {rec.timeSlot.label} — 점수 {rec.score.score}
              </div>

              {/* 바 */}
              <div className="relative flex items-end" style={{ height: "100px" }}>
                <div
                  className={cn(
                    "w-6 rounded-t transition-all duration-300",
                    scoreToBarColor(rec.score.score),
                    rec.isRecommended ? "ring-2 ring-green-400 ring-offset-1" : ""
                  )}
                  style={{ height: `${height}%` }}
                  title={`${rec.timeSlot.label}: ${rec.score.score}점`}
                />
              </div>

              {/* 시간 레이블 */}
              <span className="text-[10px] text-[var(--text-muted)] rotate-45 origin-left whitespace-nowrap">
                {rec.timeSlot.start}
              </span>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs text-[var(--text-muted)]">
        <LegendItem color="bg-green-500" label="원활 (0~30)" />
        <LegendItem color="bg-yellow-500" label="보통 (31~55)" />
        <LegendItem color="bg-orange-500" label="혼잡 (56~75)" />
        <LegendItem color="bg-red-500" label="매우혼잡 (76~100)" />
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-green-400 inline-block" />
          추천 시간대
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn("w-3 h-3 rounded-sm inline-block", color)} />
      {label}
    </span>
  );
}
