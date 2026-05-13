import { CheckCircle2, Clock } from "lucide-react";
import type { PickupRecommendation } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { scoreToBadgeClass, scoreToBarColor } from "@/lib/utils/formatters";

interface Props {
  recommendation: PickupRecommendation;
  rank?: number;
}

export function OptimalTimeCard({ recommendation: rec, rank }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex flex-col gap-3 relative overflow-hidden",
        rec.isRecommended ? "border-green-200 bg-gradient-to-br from-green-50 to-white" : "border-gray-100 bg-white"
      )}
    >
      {rank && (
        <span className="absolute top-3 right-3 text-xs font-bold text-gray-300">
          #{rank}
        </span>
      )}

      <div className="flex items-center gap-2">
        {rec.isRecommended && <CheckCircle2 size={16} className="text-green-500" />}
        <Clock size={16} className="text-gray-400" />
        <span className="font-semibold text-gray-800">{rec.timeSlot.label}</span>
        <span className="text-xs text-gray-400">({rec.timeSlot.start}~{rec.timeSlot.end})</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-gray-900">{rec.score.score}</span>
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "text-xs font-semibold rounded-full px-2 py-0.5 border w-fit",
              scoreToBadgeClass(rec.score.score)
            )}
          >
            {rec.score.level}
          </span>
          <span className="text-xs text-gray-400">평균 {rec.expectedCarCount}대</span>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={cn("h-1.5 rounded-full", scoreToBarColor(rec.score.score))}
          style={{ width: `${rec.score.score}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">{rec.reason}</p>
    </div>
  );
}
