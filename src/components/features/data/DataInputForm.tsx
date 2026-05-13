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
        {/* 날짜 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">조사 날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 시간대 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">시간대</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_SLOTS.map((s) => (
              <option key={s.id} value={s.start}>
                {s.label} ({s.start})
              </option>
            ))}
          </select>
        </div>

        {/* 구역 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">조사 구역</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* 차량 수 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">관측 차량 수</label>
          <input
            type="number"
            min={0}
            max={999}
            value={carCount}
            onChange={(e) => setCarCount(e.target.value)}
            placeholder="예: 42"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 날씨 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">날씨</label>
          <div className="flex gap-2 flex-wrap">
            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(w)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  weather === w
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">메모 (선택)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="특이사항을 입력하세요"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button type="submit" className="self-start" size="md">
        <PlusCircle size={16} />
        {submitted ? "저장됨!" : "데이터 추가"}
      </Button>
    </form>
  );
}
