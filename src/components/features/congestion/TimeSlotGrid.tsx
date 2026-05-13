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
      <p className="text-gray-400 text-sm text-center py-6">
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
            "rounded-xl border p-3 flex flex-col gap-1 relative",
            rec.isRecommended
              ? "border-green-300 bg-green-50"
              : "border-gray-100 bg-white"
          )}
        >
          {rec.isRecommended && (
            <CheckCircle
              size={14}
              className="absolute top-2 right-2 text-green-500"
            />
          )}
          <span className="text-xs font-medium text-gray-700">
            {rec.timeSlot.start}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {rec.score.score}
            <span className="text-xs font-normal text-gray-400 ml-0.5">점</span>
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold rounded-full px-1.5 py-0.5 border w-fit",
              scoreToBadgeClass(rec.score.score)
            )}
          >
            {rec.score.level}
          </span>
          <span className="text-[10px] text-gray-400">
            평균 {rec.expectedCarCount}대
          </span>
        </div>
      ))}
    </div>
  );
}
