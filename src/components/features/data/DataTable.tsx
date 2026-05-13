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
      <div className="text-center py-10 text-gray-400 text-sm">
        입력된 데이터가 없습니다. 위 폼에서 추가해 주세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            {["날짜", "시간대", "구역", "차량 수", "날씨", "혼잡도", ""].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 py-2 px-3">
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
                <tr key={rec.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-gray-700">{rec.date}</td>
                  <td className="py-2.5 px-3 text-gray-700">{rec.timeSlot}</td>
                  <td className="py-2.5 px-3 text-gray-700">
                    {AREA_MAP[rec.areaId]?.name ?? rec.areaId}
                  </td>
                  <td className="py-2.5 px-3 text-gray-900 font-medium">{rec.carCount}대</td>
                  <td className="py-2.5 px-3 text-gray-500">{rec.weather}</td>
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
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
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
