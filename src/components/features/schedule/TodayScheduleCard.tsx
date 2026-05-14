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
    <div
      className={cn(
        "glass rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden",
        isGood && "ring-1 ring-emerald-400/40 dark:ring-emerald-400/30",
        isBad  && "ring-1 ring-red-400/40 dark:ring-red-400/30"
      )}
    >
      {/* 색상 액센트 — 좌측 그라데이션 바 */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          isGood ? "bg-gradient-to-b from-emerald-400 to-green-500"
                 : isBad ? "bg-gradient-to-b from-rose-400 to-red-500"
                         : "bg-gradient-to-b from-amber-400 to-orange-500"
        )}
      />

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{schedule.academyName}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              <span className="font-medium text-slate-700 dark:text-slate-200">{schedule.endTime} 수업 종료</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {area?.name ?? schedule.areaId}
            </span>
          </div>
        </div>

        <span className={cn(
          "text-xs font-semibold rounded-full px-2.5 py-1 border shrink-0",
          scoreToBadgeClass(congestion.score)
        )}>
          {congestion.level}
        </span>
      </div>

      {/* 혼잡도 점수 바 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>혼잡도</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{congestion.score}점</span>
        </div>
        <div className="w-full bg-slate-200/60 dark:bg-white/10 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-500", scoreToBarColor(congestion.score))}
            style={{ width: `${congestion.score}%` }}
          />
        </div>
        {expectedCarCount > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500">이 시간대 평균 {expectedCarCount}대 관측</p>
        )}
      </div>

      {/* 픽업 추천 안내 */}
      <div className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm border",
        isGood ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
               : isBad ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                       : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
      )}>
        {isGood ? (
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
        )}
        <span className="font-medium">{suggestedArrivalText}</span>
      </div>

      {/* 메모 */}
      {schedule.note && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <StickyNote size={13} className="shrink-0" />
          {schedule.note}
        </div>
      )}
    </div>
  );
}
