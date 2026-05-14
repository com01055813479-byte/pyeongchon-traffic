"use client";

import { Trash2 } from "lucide-react";
import type { SurveyRecord } from "@/lib/types";
import { AREA_MAP } from "@/lib/constants/areas";
import { calcCongestionScore } from "@/lib/algorithms/congestionScore";
import { TIME_SLOT_MAP } from "@/lib/constants/timeSlots";
import { scoreToBadgeClass } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface Props {
  records: SurveyRecord[];
  onDelete: (id: string) => void;
}

export function DataTable({ records, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
        입력된 데이터가 없습니다. 위 폼에서 추가해 주세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/40 dark:border-white/10">
            {["날짜", "시간대", "구역", "차량 수", "날씨", "혼잡도", ""].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 py-2 px-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date) || b.timeSlot.localeCompare(a.timeSlot))
            .map((rec) => {
              const slot = Object.values(TIME_SLOT_MAP).find((s) => s.start === rec.timeSlot);
              const congestion = calcCongestionScore(
                rec.carCount,
                rec.areaId,
                slot?.isRushHour ?? false
              );
              return (
                <tr key={rec.id} className="border-b border-white/30 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">{rec.date}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">{rec.timeSlot}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                    {AREA_MAP[rec.areaId]?.name ?? rec.areaId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100 font-medium">{rec.carCount}대</td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{rec.weather}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                        scoreToBadgeClass(congestion.score)
                      )}
                    >
                      {congestion.level} ({congestion.score})
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onDelete(rec.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
