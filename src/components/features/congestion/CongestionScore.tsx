import { cn } from "@/lib/utils/cn";
import { scoreToBadgeClass, scoreToBarColor } from "@/lib/utils/formatters";
import type { CongestionScore as CongestionScoreType } from "@/lib/types";

interface Props {
  congestion: CongestionScoreType;
  showBar?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CongestionScoreDisplay({ congestion, showBar = true, size = "md" }: Props) {
  const { score, level, label } = congestion;

  const scoreSize = size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : "text-4xl";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <span className={cn("font-bold tabular-nums leading-none", scoreSize)}>{score}</span>
        <div className="flex flex-col gap-1 pb-0.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
              scoreToBadgeClass(score)
            )}
          >
            {level}
          </span>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      </div>

      {showBar && (
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={cn("h-2 rounded-full transition-all duration-500", scoreToBarColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
