import { LayoutDashboard, ClipboardList, BarChart3, Settings, CalendarDays } from "lucide-react";
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
    description: "지도, 위치 확인, 오늘의 픽업 일정",
  },
  {
    href: "/schedule",
    label: "시간표",
    icon: CalendarDays,
    description: "학원 수업 시간표 관리",
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
    href: "/settings",
    label: "설정",
    icon: Settings,
    description: "테마, 데이터 관리, 알고리즘 가중치",
  },
];
