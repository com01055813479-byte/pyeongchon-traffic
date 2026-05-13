"use client";

import { Trash2, Clock, MapPin, StickyNote } from "lucide-react";
import type { AcademySchedule } from "@/lib/types";
import { AREA_MAP } from "@/lib/constants/areas";
import { cn } from "@/lib/utils/cn";

interface Props {
  schedules: AcademySchedule[];
  onDelete: (id: string) => void;
  todayDay?: string; // 오늘 요일 강조용 ("월"|"화"|...)
}

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

export function ScheduleList({ schedules, onDelete, todayDay }: Props) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        <Clock size={32} className="mx-auto mb-2 opacity-30" />
        <p>등록된 시간표가 없습니다.</p>
        <p className="text-xs mt-1">위 폼에서 학원 일정을 추가해 주세요.</p>
      </div>
    );
  }

  // 종료 시간 기준 정렬
  const sorted = [...schedules].sort((a, b) => a.endTime.localeCompare(b.endTime));

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((sch) => {
        const area = AREA_MAP[sch.areaId];
        const isToday = todayDay ? sch.days.includes(todayDay as AcademySchedule["days"][0]) : false;

        return (
          <div
            key={sch.id}
            className={cn(
              "rounded-2xl border p-4 flex flex-col gap-3 transition-colors",
              isToday
                ? "border-blue-200 bg-blue-50"
                : "border-gray-100 bg-white"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {/* 학원명 + 오늘 뱃지 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{sch.academyName}</span>
                  {isToday && (
                    <span className="text-[10px] font-bold bg-blue-500 text-white rounded-full px-2 py-0.5">
                      오늘
                    </span>
                  )}
                </div>

                {/* 요일 뱃지 목록 */}
                <div className="flex gap-1 flex-wrap">
                  {DAY_ORDER.filter((d) => sch.days.includes(d as AcademySchedule["days"][0])).map((d) => (
                    <span
                      key={d}
                      className={cn(
                        "text-[11px] font-semibold rounded-md px-1.5 py-0.5 border",
                        d === todayDay
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      )}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={() => onDelete(sch.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* 종료 시간 / 구역 / 메모 */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                <span className="font-medium text-gray-800">{sch.endTime} 종료</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                {area?.name ?? sch.areaId}
              </span>
              {sch.note && (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <StickyNote size={14} className="text-gray-400" />
                  {sch.note}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
