"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  lat: number;
  lng: number;
  type: "user" | "destination";
}

interface OpenMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  routePath?: number[][]; // [[lng, lat], ...]
  height?: string;
}

// ── 커스텀 마커 아이콘 (NaverMap 과 동일한 디자인) ─────────────────────────
const userIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 6px rgba(59,130,246,.6)"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const destIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 6px rgba(239,68,68,.5)"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function OpenMap({
  center,
  zoom = 15,
  markers = [],
  routePath = [],
  height = "280px",
}: OpenMapProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const markersLayer  = useRef<L.LayerGroup | null>(null);
  const polylineRef   = useRef<L.Polyline | null>(null);

  // ── 지도 초기화 (마운트 시 1회) ─────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return; // StrictMode 중복 방지
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // OpenStreetMap 타일 (무료, API 키 불필요)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      try { mapRef.current?.remove(); } catch {}
      mapRef.current = null;
      markersLayer.current = null;
      polylineRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 마커 업데이트 ───────────────────────────────────────────────────────
  useEffect(() => {
    const map   = mapRef.current;
    const layer = markersLayer.current;
    if (!map || !layer) return;

    layer.clearLayers();

    markers.forEach(({ lat, lng, type }) => {
      L.marker([lat, lng], { icon: type === "user" ? userIcon : destIcon }).addTo(layer);
    });

    if (markers.length >= 2) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers]);

  // ── 폴리라인(경로) 업데이트 ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) {
      try { map.removeLayer(polylineRef.current); } catch {}
      polylineRef.current = null;
    }

    if (routePath.length > 1) {
      const latlngs = routePath.map(([lng, lat]) => [lat, lng] as [number, number]);
      polylineRef.current = L.polyline(latlngs, {
        color: "#3B82F6",
        weight: 5,
        opacity: 0.8,
      }).addTo(map);
    }
  }, [routePath]);

  // ── 중심 이동 ───────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markers.length >= 2) return; // 마커 2개 이상이면 fitBounds 가 처리
    map.setView([center.lat, center.lng], zoom);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-white/40 dark:border-white/10 shadow-lg shadow-blue-500/10"
      style={{ height }}
    />
  );
}
