import type { Area } from "@/lib/types";

// 평촌학원가 주요 구역 (NCP Geocoding API 로 좌표 확정)
export const AREAS: Area[] = [
  {
    id: "pyeongchon-main",
    name: "평촌대로 학원가",
    description: "평촌대로 128 (메인 도로)",
    lat: 37.3837454,
    lng: 126.9601908,
    maxCapacity: 80,
  },
  {
    id: "pyeongchon-back",
    name: "평촌동 학원가 뒷길",
    description: "평촌동 955 (학원가 후면)",
    lat: 37.3835677,
    lng: 126.9609422,
    maxCapacity: 60,
  },
  {
    id: "hogye-back",
    name: "호계동 학원가 뒷길",
    description: "호계동 1162 (학원가 후면)",
    lat: 37.3834036,
    lng: 126.9594554,
    maxCapacity: 50,
  },
];

export const AREA_MAP = Object.fromEntries(AREAS.map((a) => [a.id, a]));
