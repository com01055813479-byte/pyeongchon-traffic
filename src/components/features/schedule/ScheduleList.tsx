"use client";

import { Trash2, Clock, MapPin, StickyNote } from "lucide-react";
import type { AcademySchedule } from "@/lib/types";
import { AREA_MAP } from "@/lib/constants/areas";
import { cn } from "@/lib/utils/cn";

interface Props {
  schedules: AcademySchedule[];
  onDelete: (id: string) => void;
  todayDay?: string;
}

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

export function ScheduleList({ schedules, onDelete, todayDay }: Props) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--text-muted)] text-sm">
        <Clock size={32} className="mx-auto mb-2 opacity-30" />
        <p>등록된 시간표가 없어요</p>
        <p className="text-xs mt-1">위 폼에서 학원 일정을 추가해 주세요</p>
      </div>
    );
  }

  const sorted = [...schedules].sort((a, b) => a.endTime.localeCompare(b.endTime));

  return (
    <div className="flex flex-col">
      {sorted.map((sch, idx) => {
        const area = AREA_MAP[sch.areaId];
        const isToday = todayDay ? sch.days.includes(todayDay as AcademySchedule["days"][0]) : false;

        return (
          <div
            key={sch.id}
            className={cn(
              "flex flex-col gap-2 py-4",
              idx > 0 && "border-t border-[var(--border)]"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[var(--text-strong)]">{sch.academyName}</span>
                  {isToday && (
                    <span className="text-[10px] font-bold bg-[var(--accent)] text-white rounded-full px-2 py-0.5">
                      오늘
                    </span>
                  )}
                </div>

                <div className="flex gap-1 flex-wrap mt-0.5">
                  {DAY_ORDER.filter((d) => sch.days.includes(d as AcademySchedule["days"][0])).map((d) => (
                    <span
                      key={d}
                      className={cn(
                        "text-[11px] font-bold rounded-md px-1.5 py-0.5",
                        d === todayDay
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg-soft)] text-[var(--text-base)]"
                      )}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onDelete(sch.id)}
                className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span className="font-semibold text-[var(--text-base)]">{sch.endTime} 종료</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {area?.name ?? sch.areaId}
              </span>
              {sch.note && (
                <span className="flex items-center gap-1">
                  <StickyNote size={12} />
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
