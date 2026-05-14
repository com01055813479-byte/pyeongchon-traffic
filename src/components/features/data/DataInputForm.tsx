"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AREAS } from "@/lib/constants/areas";
import { TIME_SLOTS } from "@/lib/constants/timeSlots";
import { todayStr } from "@/lib/utils/timeUtils";
import type { SurveyRecord, WeatherCondition } from "@/lib/types";
import { PlusCircle } from "lucide-react";

interface Props {
  onAdd: (record: Omit<SurveyRecord, "id" | "createdAt">) => void;
}

const WEATHER_OPTIONS: WeatherCondition[] = ["맑음", "흐림", "비", "눈"];

const inputCls = "input rounded-xl px-3 py-2.5 text-sm";
const labelCls = "text-xs font-bold text-[var(--text-base)]";

export function DataInputForm({ onAdd }: Props) {
  const [date, setDate] = useState(todayStr());
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].start);
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const [carCount, setCarCount] = useState("");
  const [weather, setWeather] = useState<WeatherCondition>("맑음");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = parseInt(carCount, 10);
    if (isNaN(count) || count < 0) return;

    onAdd({ date, timeSlot, areaId, carCount: count, weather, note: note || undefined });
    setCarCount("");
    setNote("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>조사 날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>시간대</label>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className={inputCls}>
            {TIME_SLOTS.map((s) => (
              <option key={s.id} value={s.start}>
                {s.label} ({s.start})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>조사 구역</label>
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className={inputCls}>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>관측 차량 수</label>
          <input
            type="number"
            min={0}
            max={999}
            value={carCount}
            onChange={(e) => setCarCount(e.target.value)}
            placeholder="예: 42"
            className={inputCls}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>날씨</label>
          <div className="flex gap-1.5 flex-wrap">
            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(w)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  weather === w
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-soft)] hover:bg-[var(--border)] text-[var(--text-base)]"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>메모 (선택)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="특이사항을 입력하세요"
            className={inputCls}
          />
        </div>
      </div>

      <Button type="submit" size="lg">
        <PlusCircle size={16} />
        {submitted ? "저장됨" : "데이터 추가하기"}
      </Button>
    </form>
  );
}
