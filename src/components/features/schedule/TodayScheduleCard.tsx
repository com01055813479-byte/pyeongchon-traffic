import { Clock, MapPin, AlertCircle, CheckCircle2, StickyNote } from "lucide-react";
import type { SchedulePickupInfo } from "@/lib/types";
import { AREA_MAP } from "@/lib/constants/areas";
import { cn } from "@/lib/utils/cn";
import { scoreToBadgeClass, scoreToBarColor } from "@/lib/utils/formatters";

interface Props {
  info: SchedulePickupInfo;
}

export function TodayScheduleCard({ info }: Props) {
  const { schedule, congestion, expectedCarCount, suggestedArrivalText } = info;
  const area = AREA_MAP[schedule.areaId];

  const isGood = congestion.score <= 30;
  const isBad = congestion.score > 75;

  return (
    <div className="card rounded-2xl p-4 flex flex-col gap-3">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[var(--text-strong)] text-base truncate">
            {schedule.academyName}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              <span className="font-semibold text-[var(--text-base)]">{schedule.endTime} 종료</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {area?.name ?? schedule.areaId}
            </span>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0",
            scoreToBadgeClass(congestion.score)
          )}
        >
          {congestion.level}
        </span>
      </div>

      {/* 혼잡도 점수 바 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">혼잡도</span>
          <span className="font-bold text-[var(--text-strong)]">{congestion.score}</span>
        </div>
        <div className="w-full bg-[var(--bg-soft)] rounded-full h-1.5 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", scoreToBarColor(congestion.score))}
            style={{ width: `${congestion.score}%` }}
          />
        </div>
        {expectedCarCount > 0 && (
          <p className="text-[11px] text-[var(--text-muted)]">평균 {expectedCarCount}대 관측</p>
        )}
      </div>

      {/* 픽업 추천 */}
      <div
        className={cn(
          "flex items-start gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
          isGood
            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : isBad
            ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
            : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
        )}
      >
        {isGood ? (
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
        )}
        <span>{suggestedArrivalText}</span>
      </div>

      {/* 메모 */}
      {schedule.note && (
        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <StickyNote size={11} className="shrink-0" />
          {schedule.note}
        </div>
      )}
    </div>
  );
}
