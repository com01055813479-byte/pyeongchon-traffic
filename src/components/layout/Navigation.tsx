import { LayoutDashboard, ClipboardList, BarChart3, MapPin, CalendarDays } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "홈",
    icon: LayoutDashboard,
    description: "현재 혼잡도 및 픽업 추천 요약",
  },
  {
    href: "/schedule",
    label: "시간표",
    icon: CalendarDays,
    description: "학원 수업 시간표 관리 및 오늘의 픽업 안내",
  },
  {
    href: "/data-input",
    label: "데이터 입력",
    icon: ClipboardList,
    description: "현장 조사 데이터 입력 및 관리",
  },
  {
    href: "/analysis",
    label: "분석",
    icon: BarChart3,
    description: "시간대별 혼잡도 차트 분석",
  },
  {
    href: "/dashboard",
    label: "대시보드",
    icon: MapPin,
    description: "최적 픽업 시간대 추천 대시보드",
  },
];
