"use client";

import { scoreToBarColor } from "@/lib/utils/formatters";
import type { PickupRecommendation } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  recommendations: PickupRecommendation[];
  /** 표시할 시간대 범위 (start 값 기준) */
  filter?: { from: string; to: string };
}

const BAR_HEIGHT = 120; // px

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
    <div className="overflow-x-auto -mx-1">
      {/* 차트 영역 */}
      <div className="flex items-end gap-2 min-w-max px-1 pb-2" style={{ height: `${BAR_HEIGHT + 40}px` }}>
        {items.map((rec) => {
          const barH = Math.max((rec.score.score / maxScore) * BAR_HEIGHT, 6);
          return (
            <div
              key={rec.timeSlot.id}
              className="relative flex flex-col items-center justify-end group"
              style={{ height: `${BAR_HEIGHT + 40}px` }}
            >
              {/* 툴팁 — relative 부모 덕분에 올바르게 위치함 */}
              <div
                className={cn(
                  "absolute bottom-full mb-2 left-1/2 -translate-x-1/2",
                  "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10",
                  "bg-[var(--bg-elev)] border border-[var(--border)] shadow-md",
                  "text-[var(--text-strong)] text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap"
                )}
              >
                <span className="font-semibold">{rec.score.score}점</span>
                <span className="text-[var(--text-muted)] ml-1">· {rec.timeSlot.label}</span>
                {/* 말풍선 꼬리 */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--border)]" />
              </div>

              {/* 막대 */}
              <div
                className={cn(
                  "w-7 rounded-t-md transition-all duration-300",
                  scoreToBarColor(rec.score.score),
                  rec.isRecommended ? "ring-2 ring-emerald-400" : ""
                )}
                style={{ height: `${barH}px` }}
              />

              {/* 시간 레이블 */}
              <span className="mt-1.5 text-[10px] font-medium text-[var(--text-muted)] whitespace-nowrap">
                {rec.timeSlot.start}
              </span>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-[var(--text-muted)] px-1">
        <LegendItem color="bg-green-500" label="원활 (0~30)" />
        <LegendItem color="bg-yellow-400" label="보통 (31~55)" />
        <LegendItem color="bg-orange-500" label="혼잡 (56~75)" />
        <LegendItem color="bg-red-500" label="매우혼잡 (76~100)" />
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border-2 border-emerald-400 inline-block" />
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
