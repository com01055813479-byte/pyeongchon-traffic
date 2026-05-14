"use client";

import { useRef, useState } from "react";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  MapPin,
  Database,
  Sliders,
  Info,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSettings, ThemeMode } from "@/lib/context/SettingsContext";
import { AREAS } from "@/lib/constants/areas";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEYS = {
  schedules: "academy-schedules",
  records: "survey-records",
  settings: "app-settings-v1",
};

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light",  label: "라이트", icon: Sun },
  { value: "dark",   label: "다크",   icon: Moon },
  { value: "system", label: "시스템", icon: Monitor },
];

export default function SettingsPage() {
  const {
    settings, hydrated,
    setTheme, setDefaultAreaId, setRushHourMultiplier, resetAll,
  } = useSettings();

  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        schedules: JSON.parse(localStorage.getItem(STORAGE_KEYS.schedules) ?? "null"),
        records:   JSON.parse(localStorage.getItem(STORAGE_KEYS.records)   ?? "null"),
        settings:  JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)  ?? "null"),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pyeongchon-traffic-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setImportMsg({ ok: true, text: "백업 파일이 다운로드되었습니다." });
    } catch (e) {
      setImportMsg({ ok: false, text: "내보내기 실패: " + String(e) });
    }
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result ?? ""));
        if (data.schedules) localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(data.schedules));
        if (data.records)   localStorage.setItem(STORAGE_KEYS.records,   JSON.stringify(data.records));
        if (data.settings)  localStorage.setItem(STORAGE_KEYS.settings,  JSON.stringify(data.settings));
        setImportMsg({ ok: true, text: "복원 완료. 페이지를 새로고침하면 반영됩니다." });
      } catch {
        setImportMsg({ ok: false, text: "불러오기 실패: 잘못된 파일 형식" });
      }
    };
    reader.readAsText(file);
  }

  function handleResetAll() {
    if (!confirm("정말 모든 데이터(시간표, 조사 기록, 설정)를 초기화하시겠습니까? 되돌릴 수 없습니다.")) return;
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      resetAll();
      setImportMsg({ ok: true, text: "전체 초기화 완료. 새로고침하면 샘플 데이터로 돌아갑니다." });
    } catch {
      setImportMsg({ ok: false, text: "초기화 실패" });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 헤더 */}
      <div className="pt-2 pb-1">
        <p className="text-sm text-[var(--text-muted)] mb-1 flex items-center gap-1.5">
          <SettingsIcon size={14} />
          설정
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)] leading-tight">
          앱 설정
        </h1>
      </div>

      {/* ─── 테마 ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Sun size={16} className="text-[var(--accent)]" />
              화면 모드
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => {
              const active = hydrated && settings.theme === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-xl transition-colors",
                    active
                      ? "bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]"
                      : "bg-[var(--bg-soft)] hover:bg-[var(--border)]"
                  )}
                >
                  <Icon
                    size={20}
                    className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold",
                      active ? "text-[var(--accent-text)]" : "text-[var(--text-base)]"
                    )}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            시스템: 운영체제 설정에 자동으로 맞춥니다.
          </p>
        </CardContent>
      </Card>

      {/* ─── 기본 학원가 구역 ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--accent)]" />
              기본 학원가 구역
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {AREAS.map((a) => {
              const active = hydrated && settings.defaultAreaId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setDefaultAreaId(a.id)}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl transition-colors text-left",
                    active
                      ? "bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]"
                      : "bg-[var(--bg-soft)] hover:bg-[var(--border)]"
                  )}
                >
                  <div>
                    <p className="text-sm font-bold text-[var(--text-strong)]">{a.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{a.description}</p>
                  </div>
                  {active && (
                    <span className="text-xs font-bold text-[var(--accent-text)] shrink-0">
                      선택됨
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── 알고리즘 가중치 ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Sliders size={16} className="text-[var(--accent)]" />
              러시아워 가중치
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">현재 값</span>
            <span className="text-2xl font-bold text-[var(--text-strong)]">
              ×{(hydrated ? settings.rushHourMultiplier : 1.15).toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={1.0}
            max={2.0}
            step={0.05}
            value={hydrated ? settings.rushHourMultiplier : 1.15}
            onChange={(e) => setRushHourMultiplier(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[11px] text-[var(--text-muted)] mt-2">
            <span>×1.00</span>
            <span>×1.50</span>
            <span>×2.00</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
            러시아워(아침/저녁 통근 시간)에 차량 수에 곱해지는 가중치입니다. 값이 클수록 같은 차량 수도 더 혼잡하다고 판단합니다.
          </p>
        </CardContent>
      </Card>

      {/* ─── 데이터 관리 ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Database size={16} className="text-[var(--accent)]" />
              데이터 관리
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} /> 내보내기
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> 불러오기
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = "";
            }}
          />
          <Button variant="danger" onClick={handleResetAll}>
            <Trash2 size={16} /> 전체 초기화
          </Button>
          {importMsg && (
            <div className={cn(
              "text-xs px-3 py-2.5 rounded-lg font-semibold",
              importMsg.ok
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
            )}>
              {importMsg.text}
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            모든 데이터는 브라우저에 저장됩니다. 다른 기기로 옮기려면 내보내기 → 불러오기 하세요.
          </p>
        </CardContent>
      </Card>

      {/* ─── 앱 정보 — 리스트 스타일 ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Info size={16} className="text-[var(--accent)]" />
              앱 정보
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <InfoRow label="버전" value="1.1.0" />
          <InfoRow label="프로젝트" value="평촌학원가 차량 혼잡도 분석" />
          <InfoRow label="용도" value="학교 동아리 프로젝트" />
          <InfoRow label="지도 데이터" value="OpenStreetMap" />
          <InfoRow label="길찾기" value="OSRM" />
          <InfoRow label="프레임워크" value="Next.js 15 · Tailwind v4" last />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        "flex justify-between items-center py-3",
        !last && "border-b border-[var(--border)]"
      )}
    >
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--text-strong)] text-right">{value}</span>
    </div>
  );
}
