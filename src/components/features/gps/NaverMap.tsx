"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export interface MapMarker {
  lat: number;
  lng: number;
  type: "user" | "destination";
}

interface NaverMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  routePath?: number[][];
  height?: string;
}

const ICON_HTML: Record<"user" | "destination", string> = {
  user:        `<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 6px rgba(59,130,246,.6)"></div>`,
  destination: `<div style="width:14px;height:14px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 6px rgba(239,68,68,.5)"></div>`,
};

type MapStatus = "loading" | "ready" | "error";

/** window.naver.maps 를 읽어 반환. 핵심 클래스(Map/LatLng)만 검사 → 나머지는 사용처에서 보호. */
function getSDK() {
  const nm = (typeof window !== "undefined") ? window.naver?.maps : undefined;
  if (nm?.Map && nm?.LatLng) {
    return nm;
  }
  return null;
}

export function NaverMap({
  center,
  zoom = 15,
  markers = [],
  routePath = [],
  height = "280px",
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<naver.maps.Map | null>(null);
  const markerRefs   = useRef<naver.maps.Marker[]>([]);
  const polylineRef  = useRef<naver.maps.Polyline | null>(null);

  const [status, setStatus] = useState<MapStatus>("loading");

  // ── 지도 생성 ─────────────────────────────────────────────────────────────
  function createMap() {
    if (mapRef.current) return;             // 이미 생성됨 → 중복 방지
    const nm = getSDK();
    if (!nm || !containerRef.current) return;

    try {
      mapRef.current = new nm.Map(containerRef.current, {
        center: new nm.LatLng(center.lat, center.lng),
        zoom,
        zoomControl: true,
      });
      setStatus("ready");
    } catch (e) {
      console.error("[NaverMap] 초기화 실패:", e);
      setStatus("error");
    }
  }

  // ── SDK 준비 감지 + 지도 초기화 ──────────────────────────────────────────
  useEffect(() => {
    // 경로 A: layout.tsx 의 Script 가 이미 로드 완료된 상태
    if (getSDK()) {
      createMap();
      return () => {
        markerRefs.current.forEach(m => { try { m.setMap(null); } catch {} });
        markerRefs.current = [];
        try { polylineRef.current?.setMap(null); } catch {}
        polylineRef.current = null;
      };
    }

    // 경로 B: SDK 가 아직 로드 중 → 완료 이벤트(naverReady) 대기 + 폴링 백업
    const handler = () => { createMap(); };
    window.addEventListener("naverReady", handler);

    // 이벤트를 놓쳤거나 callback 호출이 지연될 경우를 대비한 폴링 (200ms × 50 = 최대 10초)
    let tries = 0;
    const poll = window.setInterval(() => {
      tries++;
      if (getSDK()) {
        window.clearInterval(poll);
        createMap();
      } else if (tries > 50) {
        window.clearInterval(poll);
      }
    }, 200);

    return () => {
      window.removeEventListener("naverReady", handler);
      window.clearInterval(poll);
      markerRefs.current.forEach(m => { try { m.setMap(null); } catch {} });
      markerRefs.current = [];
      try { polylineRef.current?.setMap(null); } catch {}
      polylineRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 마커 업데이트 ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const nm = getSDK();          // 매번 window 에서 직접 읽음 → 캐시 문제 없음
    if (!nm) return;

    markerRefs.current.forEach(m => { try { m.setMap(null); } catch {} });
    markerRefs.current = [];

    markers.forEach(({ lat, lng, type }) => {
      try {
        const m = new nm.Marker({
          position: new nm.LatLng(lat, lng),
          icon: { content: ICON_HTML[type], anchor: new nm.Point(7, 7) },
        });
        m.setMap(mapRef.current!);
        markerRefs.current.push(m);
      } catch (e) {
        console.error("[NaverMap] 마커 생성 실패:", e);
      }
    });

    if (markers.length >= 2) {
      try {
        const bounds = new nm.LatLngBounds();
        markers.forEach(({ lat, lng }) => bounds.extend(new nm.LatLng(lat, lng)));
        mapRef.current.fitBounds(bounds, 80);
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, status]);

  // ── 폴리라인 업데이트 ────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const nm = getSDK();
    if (!nm) return;

    try { polylineRef.current?.setMap(null); } catch {}
    polylineRef.current = null;

    if (routePath.length > 1) {
      try {
        polylineRef.current = new nm.Polyline({
          map: mapRef.current,
          path: routePath.map(([lng, lat]) => new nm.LatLng(lat, lng)),
          strokeColor:   "#3B82F6",
          strokeWeight:  5,
          strokeOpacity: 0.8,
          strokeStyle:   "solid",
        });
      } catch (e) {
        console.error("[NaverMap] 폴리라인 생성 실패:", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePath, status]);

  // ── 중심 이동 ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || markers.length >= 2) return;
    const nm = getSDK();
    if (!nm) return;
    try {
      mapRef.current.setCenter(new nm.LatLng(center.lat, center.lng));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, status, markers.length]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
      style={{ height }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-2 pointer-events-none">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs text-gray-400">지도 불러오는 중...</span>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 gap-3 p-6">
          <AlertCircle size={28} className="text-red-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-red-600">지도를 불러올 수 없습니다</p>
            <p className="text-xs text-red-400 mt-1 leading-relaxed">
              네이버 클라우드 콘솔 → Maps → 앱 설정에서<br />
              <b>Web Service URL</b>에{" "}
              <code className="bg-red-100 px-1 rounded">http://localhost:3000</code>을 추가해 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
