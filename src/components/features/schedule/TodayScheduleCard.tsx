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
        "rounded-2xl border p-5 flex flex-col gap-4",
        isGood
          ? "border-green-200 bg-gradient-to-br from-green-50 to-white"
          : isBad
          ? "border-red-200 bg-gradient-to-br from-red-50 to-white"
          : "border-gray-100 bg-white"
      )}
    >
      {/* 헤더: 학원명 + 종료 시간 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base">{schedule.academyName}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-gray-400" />
              <span className="font-medium text-gray-700">{schedule.endTime} 수업 종료</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-gray-400" />
              {area?.name ?? schedule.areaId}
            </span>
          </div>
        </div>

        {/* 혼잡도 뱃지 */}
        <span
          className={cn(
            "text-xs font-semibold rounded-full px-2.5 py-1 border shrink-0",
            scoreToBadgeClass(congestion.score)
          )}
        >
          {congestion.level}
        </span>
      </div>

      {/* 혼잡도 점수 바 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span>혼잡도</span>
          <span className="font-semibold text-gray-700">{congestion.score}점</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-500", scoreToBarColor(congestion.score))}
            style={{ width: `${congestion.score}%` }}
          />
        </div>
        {expectedCarCount > 0 && (
          <p className="text-xs text-gray-400">이 시간대 평균 {expectedCarCount}대 관측</p>
        )}
      </div>

      {/* 픽업 추천 안내 */}
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm",
          isGood
            ? "bg-green-100 text-green-800"
            : isBad
            ? "bg-red-100 text-red-800"
            : "bg-yellow-50 text-yellow-800"
        )}
      >
        {isGood ? (
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
        )}
        <span className="font-medium">{suggestedArrivalText}</span>
      </div>

      {/* 메모 */}
      {schedule.note && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <StickyNote size={13} className="text-gray-400 shrink-0" />
          {schedule.note}
        </div>
      )}
    </div>
  );
}
