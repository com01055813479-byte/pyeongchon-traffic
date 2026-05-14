"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadNaverMaps,
  type NaverNamespace,
  type NaverMapInstance,
  type NaverMarker,
  type NaverPolyline,
  type NaverTrafficLayer,
} from "@/lib/utils/naverMapLoader";

function getNaver(): NaverNamespace | null {
  if (typeof window === "undefined") return null;
  const nm = (window as unknown as { naver?: NaverNamespace }).naver;
  // 인증 실패 시 naver 는 존재해도 naver.maps 가 비어 있을 수 있음
  if (!nm?.maps?.LatLngBounds || !nm?.maps?.Marker || !nm?.maps?.LatLng) return null;
  return nm;
}

export interface MapMarker {
  lat: number;
  lng: number;
  type: "user" | "destination";
}

interface NaverMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  routePath?: number[][]; // [[lng, lat], ...]
  height?: string;
  /** 실시간 교통량 레이어 (도로 색깔로 혼잡도 표시) */
  showTraffic?: boolean;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? "";

export function NaverMap({
  center,
  zoom = 15,
  markers = [],
  routePath = [],
  height = "280px",
  showTraffic = false,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<NaverMapInstance | null>(null);
  const markersRef   = useRef<NaverMarker[]>([]);
  const polylineRef  = useRef<NaverPolyline | null>(null);
  const trafficRef   = useRef<NaverTrafficLayer | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── 지도 초기화 (마운트 1회) ────────────────────────────────────────
  useEffect(() => {
    if (!CLIENT_ID) {
      setError("NEXT_PUBLIC_NAVER_CLIENT_ID 환경변수가 비어 있습니다. Vercel 환경변수를 확인해 주세요.");
      return;
    }
    let canceled = false;

    // 네이버 SDK 가 호출하는 전역 인증 실패 콜백 — 화면에 즉시 반영
    (window as unknown as { navermap_authFailure?: () => void }).navermap_authFailure = () => {
      if (!canceled) {
        setError(
          "네이버 지도 인증이 실패했습니다. NCP 콘솔의 'Web 서비스 URL'에 " +
          "https://pyeongchon-traffic.vercel.app 가 등록되어 있는지 확인해 주세요."
        );
        setReady(false);
      }
    };

    loadNaverMaps(CLIENT_ID)
      .then((nm) => {
        if (canceled || !containerRef.current || mapRef.current) return;
        try {
          mapRef.current = new nm.maps.Map(containerRef.current, {
            center: new nm.maps.LatLng(center.lat, center.lng),
            zoom,
            zoomControl: true,
            zoomControlOptions: {
              // SMALL = 2, 작은 컨트롤
              style: nm.maps.ZoomControlStyle?.SMALL ?? 2,
              // TOP_LEFT = 1, 좌측 상단 (우측 상단의 교통량 토글과 충돌 방지)
              position: nm.maps.Position?.TOP_LEFT ?? 1,
            },
            // 네이버 로고 옆 정보 컨트롤 비활성 (공간 절약)
            mapDataControl: false,
            logoControl: true,
            scaleControl: false,
          });
          setReady(true);
        } catch (e) {
          console.error("[NaverMap] init error:", e);
          setError("지도 초기화 실패 — 네이버 콘솔에서 Web 서비스 URL 등록을 확인해 주세요.");
        }
      })
      .catch((e: Error) => {
        console.error("[NaverMap] load error:", e);
        if (!canceled) setError(e.message);
      });

    return () => {
      canceled = true;
      markersRef.current.forEach((m) => {
        try { m.setMap(null); } catch {}
      });
      markersRef.current = [];
      if (polylineRef.current) {
        try { polylineRef.current.setMap(null); } catch {}
        polylineRef.current = null;
      }
      if (trafficRef.current) {
        try { trafficRef.current.setMap(null); } catch {}
        trafficRef.current = null;
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 마커 업데이트 ────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const nm  = getNaver();
    if (!map || !nm) return;

    try {
      markersRef.current.forEach((m) => {
        try { m.setMap(null); } catch {}
      });
      markersRef.current = [];

      if (markers.length === 0) return;

      const bounds = new nm.maps.LatLngBounds();
      markers.forEach(({ lat, lng, type }) => {
        const isUser = type === "user";
        const color  = isUser ? "#3B82F6" : "#EF4444";
        const size   = isUser ? 16 : 14;
        const html =
          `<div style="width:${size}px;height:${size}px;border-radius:50%;` +
          `background:${color};border:3px solid white;` +
          `box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`;

        const marker = new nm.maps.Marker({
          position: new nm.maps.LatLng(lat, lng),
          map,
          icon: {
            content: html,
            anchor: new nm.maps.Point((size + 6) / 2, (size + 6) / 2),
          },
        });
        markersRef.current.push(marker);
        bounds.extend(new nm.maps.LatLng(lat, lng));
      });

      if (markers.length >= 2) {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    } catch (e) {
      console.error("[NaverMap] marker update error:", e);
    }
  }, [markers, ready]);

  // ── 경로 폴리라인 ────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const nm  = getNaver();
    if (!map || !nm) return;

    try {
      if (polylineRef.current) {
        try { polylineRef.current.setMap(null); } catch {}
        polylineRef.current = null;
      }

      if (routePath.length > 1) {
        const path = routePath.map(([lng, lat]) => new nm.maps.LatLng(lat, lng));
        polylineRef.current = new nm.maps.Polyline({
          map,
          path,
          strokeColor:   "#3B82F6",
          strokeWeight:  5,
          strokeOpacity: 0.85,
        });
      }
    } catch (e) {
      console.error("[NaverMap] polyline update error:", e);
    }
  }, [routePath, ready]);

  // ── 실시간 교통량 레이어 ────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const nm  = getNaver();
    if (!map || !nm) return;

    try {
      if (showTraffic) {
        if (!trafficRef.current) {
          // 5분마다 자동 갱신
          trafficRef.current = new nm.maps.TrafficLayer({ interval: 300000 });
        }
        trafficRef.current.setMap(map);
      } else {
        if (trafficRef.current) {
          trafficRef.current.setMap(null);
        }
      }
    } catch (e) {
      console.error("[NaverMap] traffic layer error:", e);
    }
  }, [showTraffic, ready]);

  // ── 중심 이동 ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const nm  = getNaver();
    if (!map || !nm) return;
    if (markers.length >= 2) return; // fitBounds 가 처리
    try {
      map.setCenter(new nm.maps.LatLng(center.lat, center.lng));
    } catch (e) {
      console.error("[NaverMap] setCenter error:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, ready]);

  if (error) {
    return (
      <div
        className="w-full rounded-2xl flex flex-col items-center justify-center text-sm px-4 py-6 text-center gap-2"
        style={{
          height,
          backgroundColor: "var(--bg-soft)",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
        }}
      >
        <span className="font-semibold text-[var(--text-base)]">지도를 불러올 수 없습니다</span>
        <span className="text-xs opacity-80 leading-relaxed max-w-xs">{error}</span>
        <span className="text-[10px] opacity-60 mt-1">
          (Vercel 환경변수 + 네이버 콘솔의 Web 서비스 URL 등록 확인)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height,
        border: "1px solid var(--border)",
        // 지도 컨트롤이 페이지의 다른 UI(헤더 등) 위로 떠오르지 않도록
        // 별도 stacking context 형성
        isolation: "isolate",
        zIndex: 0,
      }}
    />
  );
}
