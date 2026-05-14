import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary:
    "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 " +
    "text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20",
  secondary:
    "bg-white/60 hover:bg-white/80 text-slate-800 backdrop-blur " +
    "dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-100 " +
    "border border-white/40 dark:border-white/10",
  ghost:
    "hover:bg-white/40 text-slate-700 dark:hover:bg-white/10 dark:text-slate-200",
  danger:
    "bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 " +
    "text-white shadow-lg shadow-red-500/30",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-medium transition-all duration-200 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
        "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
