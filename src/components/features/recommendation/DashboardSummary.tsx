import { TrendingDown, TrendingUp, ClipboardList, Car } from "lucide-react";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  stats: DashboardStats;
}

export function DashboardSummary({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={<ClipboardList size={18} />}
        iconBg="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
        label="총 조사 건수"
        value={`${stats.totalSurveys}`}
        unit="건"
      />
      <StatCard
        icon={<Car size={18} />}
        iconBg="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
        label="평균 혼잡도"
        value={`${stats.avgCongestionScore}`}
        unit="점"
      />
      <StatCard
        icon={<TrendingDown size={18} />}
        iconBg="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        label="최적 픽업"
        value={stats.bestPickupSlot?.start ?? "—"}
        unit={stats.bestPickupSlot ? "" : ""}
      />
      <StatCard
        icon={<TrendingUp size={18} />}
        iconBg="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
        label="가장 혼잡"
        value={stats.worstPickupSlot?.start ?? "—"}
        unit={stats.worstPickupSlot ? "" : ""}
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="card rounded-2xl p-4 flex flex-col gap-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
        <p className="mt-1 leading-none">
          <span className="text-xl font-bold text-[var(--text-strong)]">{value}</span>
          {unit && (
            <span className="text-sm font-medium text-[var(--text-muted)] ml-0.5">{unit}</span>
          )}
        </p>
      </div>
    </div>
  );
}
