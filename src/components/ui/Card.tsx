import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Glass Morphism 카드.
 * 반투명 배경 + 백드롭 블러 + 미세한 보더.
 * .glass 클래스는 globals.css 에서 라이트/다크 모드를 자동 처리.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("glass rounded-2xl p-5", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-900 dark:text-slate-100", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("", className)}>{children}</div>;
}
