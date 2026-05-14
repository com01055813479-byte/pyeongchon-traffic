"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Navigation, Clock, Route, Loader2, AlertCircle } from "lucide-react";
import type { UserLocation, TravelTimeResult } from "@/lib/types";
import { AREAS } from "@/lib/constants/areas";
import { formatDistance, formatDuration } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import type { MapMarker } from "./OpenMap";

const OpenMap = dynamic(
  () => import("./OpenMap").then(m => m.OpenMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl flex items-center justify-center text-sm"
        style={{
          height: 300,
          backgroundColor: "var(--bg-soft)",
          color: "var(--text-muted)",
        }}
      >
        지도 불러오는 중...
      </div>
    ),
  }
);

interface Props {
  userLocation: UserLocation | null;
}

const DEFAULT_CENTER = { lat: 37.3908, lng: 126.9488 };

export function TravelTimeEstimate({ userLocation }: Props) {
  const [selectedAreaId, setSelectedAreaId] = useState(AREAS[0].id);
  const [result, setResult]   = useState<TravelTimeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<number[][]>([]);

  const markers: MapMarker[] = [];
  if (userLocation) {
    markers.push({ lat: userLocation.lat, lng: userLocation.lng, type: "user" });
  }
  const destArea = AREAS.find((a) => a.id === selectedAreaId);
  if (destArea) {
    markers.push({ lat: destArea.lat, lng: destArea.lng, type: "destination" });
  }

  const mapCenter =
    userLocation && destArea
      ? { lat: (userLocation.lat + destArea.lat) / 2, lng: (userLocation.lng + destArea.lng) / 2 }
      : destArea
      ? { lat: destArea.lat, lng: destArea.lng }
      : DEFAULT_CENTER;

  async function handleCalculate() {
    if (!userLocation || !destArea) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setRoutePath([]);

    try {
      const params = new URLSearchParams({
        startLat: String(userLocation.lat),
        startLng: String(userLocation.lng),
        goalLat:  String(destArea.lat),
        goalLng:  String(destArea.lng),
      });

      const res  = await fetch(`/api/directions?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "경로 계산에 실패했습니다.");
      }

      setResult({
        durationSeconds: Math.round(data.duration / 1000),
        durationText:    formatDuration(Math.round(data.duration / 1000)),
        distance:        data.distance,
        distanceText:    formatDistance(data.distance),
      });

      if (Array.isArray(data.path)) {
        setRoutePath(data.path);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <OpenMap
        center={mapCenter}
        zoom={userLocation ? 13 : 15}
        markers={markers}
        routePath={routePath}
        height="280px"
      />

      {/* 목적지 선택 + 계산 버튼 */}
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex flex-col gap-1.5 flex-1 min-w-40">
          <label className="text-xs font-semibold text-[var(--text-base)]">목적지 구역</label>
          <select
            value={selectedAreaId}
            onChange={(e) => {
              setSelectedAreaId(e.target.value);
              setResult(null);
              setRoutePath([]);
            }}
            className="input rounded-xl px-3 py-2.5 text-sm"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!userLocation || loading}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} />
          )}
          {loading ? "계산 중..." : "소요 시간 계산"}
        </Button>
      </div>

      {!userLocation && (
        <p className="text-xs text-[var(--text-muted)]">
          위 &apos;내 위치 확인&apos; 버튼을 먼저 눌러 GPS를 허용해 주세요.
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">경로 계산 실패</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* 결과 — 토스 스타일 통계 */}
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[var(--accent)]" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">예상 소요 시간</p>
            </div>
            <p className="text-2xl font-bold text-[var(--text-strong)] leading-none">
              {result.durationText}
            </p>
          </div>
          <div className="card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Route size={14} className="text-[var(--text-muted)]" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">경로 거리</p>
            </div>
            <p className="text-2xl font-bold text-[var(--text-strong)] leading-none">
              {result.distanceText}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          내 위치
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          목적지
        </span>
        {routePath.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-500 inline-block rounded" />
            경로
          </span>
        )}
      </div>
    </div>
  );
}
