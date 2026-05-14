import { cn } from "@/lib/utils/cn";
import { scoreToBadgeClass } from "@/lib/utils/formatters";
import type { PickupRecommendation } from "@/lib/types";
import { CheckCircle } from "lucide-react";

interface Props {
  recommendations: PickupRecommendation[];
}

export function TimeSlotGrid({ recommendations }: Props) {
  const withData = recommendations.filter((r) => r.expectedCarCount > 0);

  if (withData.length === 0) {
    return (
      <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">
        아직 입력된 조사 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {withData.map((rec) => (
        <div
          key={rec.timeSlot.id}
          className={cn(
            "glass rounded-xl p-3 flex flex-col gap-1 relative",
            rec.isRecommended && "ring-1 ring-emerald-400/40 dark:ring-emerald-400/30"
          )}
        >
          {rec.isRecommended && (
            <CheckCircle
              size={14}
              className="absolute top-2 right-2 text-emerald-500 dark:text-emerald-400"
            />
          )}
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {rec.timeSlot.start}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {rec.score.score}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">점</span>
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold rounded-full px-1.5 py-0.5 border w-fit",
              scoreToBadgeClass(rec.score.score)
            )}
          >
            {rec.score.level}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            평균 {rec.expectedCarCount}대
          </span>
        </div>
      ))}
    </div>
  );
}
