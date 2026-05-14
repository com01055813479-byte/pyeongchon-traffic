"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AREAS } from "@/lib/constants/areas";
import type { AcademySchedule, DayOfWeek } from "@/lib/types";

const ALL_DAYS: DayOfWeek[] = ["월", "화", "수", "목", "금", "토", "일"];

interface Props {
  onAdd: (schedule: Omit<AcademySchedule, "id">) => void;
}

const inputCls = "input rounded-xl px-3 py-2.5 text-sm";
const labelCls = "text-xs font-bold text-[var(--text-base)]";
const helpCls  = "text-xs text-[var(--text-muted)]";

export function ScheduleForm({ onAdd }: Props) {
  const [academyName, setAcademyName] = useState("");
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [endTime, setEndTime] = useState("19:00");
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleDay(day: DayOfWeek) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!academyName.trim() || days.length === 0) return;

    onAdd({ academyName: academyName.trim(), days, endTime, areaId, note: note.trim() || undefined });

    setAcademyName("");
    setDays([]);
    setEndTime("19:00");
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>학원 이름 <span className="text-rose-500">*</span></label>
        <input
          type="text"
          value={academyName}
          onChange={(e) => setAcademyName(e.target.value)}
          placeholder="예: 수학 학원, 영어 학원"
          className={inputCls}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelCls}>수업 요일 <span className="text-rose-500">*</span></label>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_DAYS.map((day) => {
            const active = days.includes(day);
            const isWeekend = day === "토" || day === "일";
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : `bg-[var(--bg-soft)] hover:bg-[var(--border)] ${
                        isWeekend ? "text-rose-500 dark:text-rose-400" : "text-[var(--text-base)]"
                      }`
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {days.length === 0 && <p className={helpCls}>요일을 1개 이상 선택해 주세요</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>수업 종료 시간 <span className="text-rose-500">*</span></label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputCls}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>픽업 구역 <span className="text-rose-500">*</span></label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className={inputCls}
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>픽업 메모 (선택)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 3층 출구 앞, 정문에서 대기"
          className={inputCls}
        />
      </div>

      <Button type="submit" disabled={!academyName.trim() || days.length === 0} size="lg">
        <PlusCircle size={16} />
        {saved ? "저장됨" : "시간표 추가하기"}
      </Button>
    </form>
  );
}
