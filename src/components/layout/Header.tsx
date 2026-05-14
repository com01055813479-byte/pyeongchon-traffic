"use client";

import { Car, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NAV_ITEMS } from "./Navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/30 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-300 dark:to-indigo-300"
        >
          <Car size={22} className="text-blue-600 dark:text-blue-300" />
          <span className="hidden sm:block">평촌학원가 혼잡도</span>
          <span className="block sm:hidden">평촌 혼잡도</span>
        </Link>

        {/* PC 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/30 dark:border-white/5 px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "text-slate-700 hover:bg-white/40 dark:text-slate-200 dark:hover:bg-white/10"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
