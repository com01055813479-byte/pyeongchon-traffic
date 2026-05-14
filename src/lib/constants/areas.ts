import type { Area } from "@/lib/types";

// 평촌학원가 주요 구역
export const AREAS: Area[] = [
  {
    id: "pyeongchon-main",
    name: "평촌학원가 중앙로",
    description: "평촌학원가 메인 도로 (호계동)",
    lat: 37.3908,
    lng: 126.9488,
    maxCapacity: 80,
  },
  {
    id: "pyeongchon-north",
    name: "평촌학원가 북쪽",
    description: "귀인중학교 사거리 방면",
    lat: 37.3928,
    lng: 126.9478,
    maxCapacity: 60,
  },
  {
    id: "pyeongchon-south",
    name: "평촌학원가 남쪽",
    description: "평촌역 인근 골목",
    lat: 37.3882,
    lng: 126.9498,
    maxCapacity: 50,
  },
];

export const AREA_MAP = Object.fromEntries(AREAS.map((a) => [a.id, a]));
