import { TrendingDown, TrendingUp, ClipboardList, Car } from "lucide-react";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { scoreToBadgeClass } from "@/lib/utils/formatters";

interface Props {
  stats: DashboardStats;
}

export function DashboardSummary({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={<ClipboardList size={20} className="text-blue-500" />}
        label="총 조사 건수"
        value={`${stats.totalSurveys}건`}
        iconBg="from-blue-400 to-blue-600"
      />
      <StatCard
        icon={<Car size={20} className="text-purple-500" />}
        label="평균 혼잡도"
        value={`${stats.avgCongestionScore}점`}
        badge={stats.avgCongestionScore > 0 ? (
          <span className={cn(
            "text-[10px] font-semibold rounded-full px-1.5 py-0.5 border",
            scoreToBadgeClass(stats.avgCongestionScore)
          )}>
            {stats.avgCongestionScore <= 30 ? "원활" : stats.avgCongestionScore <= 55 ? "보통" : stats.avgCongestionScore <= 75 ? "혼잡" : "매우혼잡"}
          </span>
        ) : null}
        iconBg="from-purple-400 to-purple-600"
      />
      <StatCard
        icon={<TrendingDown size={20} className="text-emerald-500" />}
        label="최적 픽업 시간대"
        value={stats.bestPickupSlot?.label ?? "데이터 부족"}
        iconBg="from-emerald-400 to-green-600"
      />
      <StatCard
        icon={<TrendingUp size={20} className="text-rose-500" />}
        label="가장 혼잡한 시간대"
        value={stats.worstPickupSlot?.label ?? "데이터 부족"}
        iconBg="from-rose-400 to-red-600"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  badge,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10",
        "bg-gradient-to-br opacity-90", iconBg
      )}>
        <div className="text-white drop-shadow-sm">{icon}</div>
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
        {badge && <div className="mt-1">{badge}</div>}
      </div>
    </div>
  );
}
