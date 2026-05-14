import { LayoutDashboard, BarChart3, Settings, CalendarDays } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

/**
 * 공개 네비게이션 — 일반 사용자에게 보이는 메뉴.
 * "데이터 입력"(/data-input)은 동아리원만 사용하므로 URL 로만 접근 (메뉴에 노출 X).
 */
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
    description: "학원 수업 시간표",
  },
  {
    href: "/analysis",
    label: "분석",
    icon: BarChart3,
    description: "시간대별 혼잡도 차트",
  },
  {
    href: "/settings",
    label: "설정",
    icon: Settings,
    description: "테마, 데이터 관리, 알고리즘 가중치",
  },
];
