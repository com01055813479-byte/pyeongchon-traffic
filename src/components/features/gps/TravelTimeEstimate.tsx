"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Navigation, Clock, Route, Loader2, AlertCircle } from "lucide-react";
import type { UserLocation, TravelTimeResult } from "@/lib/types";
import { AREAS } from "@/lib/constants/areas";
import { formatDistance, formatDuration } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import type { MapMarker } from "./OpenMap";

// Leaflet 은 window 객체를 사용하므로 SSR 비활성화 + 클라이언트 전용 로딩
const OpenMap = dynamic(
  () => import("./OpenMap").then(m => m.OpenMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400" style={{ height: 300 }}>
        지도 불러오는 중...
      </div>
    ),
  }
);

interface Props {
  userLocation: UserLocation | null;
}

// 평촌학원가 기본 중심 좌표
const DEFAULT_CENTER = { lat: 37.3897, lng: 126.9519 };

export function TravelTimeEstimate({ userLocation }: Props) {
  const [selectedAreaId, setSelectedAreaId] = useState(AREAS[0].id);
  const [result, setResult]   = useState<TravelTimeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<number[][]>([]);

  // 지도 마커 목록 계산
  const markers: MapMarker[] = [];
  if (userLocation) {
    markers.push({ lat: userLocation.lat, lng: userLocation.lng, type: "user" });
  }
  const destArea = AREAS.find((a) => a.id === selectedAreaId);
  if (destArea) {
    markers.push({ lat: destArea.lat, lng: destArea.lng, type: "destination" });
  }

  // 지도 중심: 사용자 위치가 있으면 중간점, 없으면 학원가 기본값
  const mapCenter =
    userLocation && destArea
      ? {
          lat: (userLocation.lat + destArea.lat) / 2,
          lng: (userLocation.lng + destArea.lng) / 2,
        }
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
      {/* OpenStreetMap (Leaflet) */}
      <OpenMap
        center={mapCenter}
        zoom={userLocation ? 13 : 15}
        markers={markers}
        routePath={routePath}
        height="300px"
      />

      {/* 목적지 선택 + 계산 버튼 */}
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-40">
          <label className="text-sm font-medium text-gray-700">목적지 구역</label>
          <select
            value={selectedAreaId}
            onChange={(e) => {
              setSelectedAreaId(e.target.value);
              setResult(null);
              setRoutePath([]);
            }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
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

      {/* 위치 미확인 안내 */}
      {!userLocation && (
        <p className="text-xs text-gray-400">
          위 &apos;내 위치 확인&apos; 버튼을 먼저 눌러 GPS를 허용해 주세요.
        </p>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">경로 계산 실패</p>
            <p className="text-xs mt-0.5 text-red-500">{error}</p>
            <p className="text-xs mt-1 text-red-400">
              경로 서비스가 일시적으로 불안정할 수 있습니다. 잠시 후 다시 시도해 주세요.
            </p>
          </div>
        </div>
      )}

      {/* 결과 카드 */}
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
            <Clock size={20} className="text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-blue-500 font-medium">예상 소요 시간</p>
              <p className="text-xl font-bold text-blue-800">{result.durationText}</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <Route size={20} className="text-gray-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">실제 경로 거리</p>
              <p className="text-xl font-bold text-gray-800">{result.distanceText}</p>
            </div>
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className="flex gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          내 위치
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          목적지
        </span>
        {routePath.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-blue-400 inline-block rounded" />
            경로
          </span>
        )}
      </div>
    </div>
  );
}
