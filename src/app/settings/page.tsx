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
  Github,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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

  // ── 데이터 내보내기 ─────────────────────────────────────────────────────
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

  // ── 데이터 불러오기 ─────────────────────────────────────────────────────
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

  // ── 전체 초기화 ─────────────────────────────────────────────────────────
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
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/20">
          <SettingsIcon size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">설정</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            화면 모드, 기본 구역, 데이터 관리, 알고리즘 조정
          </p>
        </div>
      </div>

      {/* ─── 테마 ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Sun size={16} className="text-amber-500" />
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
                    "flex flex-col items-center gap-2 py-4 rounded-xl border transition-all",
                    active
                      ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/50 dark:border-blue-300/30 ring-2 ring-blue-400/40"
                      : "bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                  )}
                >
                  <Icon size={20} className={active ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-300"} />
                  <span className={cn(
                    "text-xs font-medium",
                    active ? "text-blue-700 dark:text-blue-200" : "text-slate-600 dark:text-slate-300"
                  )}>{opt.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            시스템: 운영체제 설정에 자동으로 맞춥니다.
          </p>
        </CardContent>
      </Card>

      {/* ─── 기본 학원가 구역 ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" />
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
                    "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                    active
                      ? "bg-gradient-to-r from-emerald-500/15 to-green-500/15 border-emerald-400/50 ring-2 ring-emerald-400/30"
                      : "bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{a.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.description}</p>
                  </div>
                  {active && <Badge className="bg-emerald-500 text-white border-emerald-400">선택됨</Badge>}
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
              <Sliders size={16} className="text-fuchsia-500" />
              알고리즘 — 러시아워 가중치
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">현재 값</span>
            <span className="text-lg font-bold text-fuchsia-600 dark:text-fuchsia-300">
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
            className="w-full accent-fuchsia-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>×1.00 (가중치 없음)</span>
            <span>×1.50</span>
            <span>×2.00 (강함)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            러시아워(아침/저녁 통근 시간)에 차량 수에 추가로 곱해지는 가중치입니다.
            값이 클수록 같은 차량 수도 더 혼잡하다고 판단합니다.
          </p>
        </CardContent>
      </Card>

      {/* ─── 데이터 관리 ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Database size={16} className="text-blue-500" />
              데이터 관리
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} /> 내보내기 (JSON)
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
          <Button variant="danger" onClick={handleResetAll} className="justify-center">
            <Trash2 size={16} /> 전체 초기화
          </Button>
          {importMsg && (
            <div className={cn(
              "text-xs px-3 py-2 rounded-lg border",
              importMsg.ok
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
            )}>
              {importMsg.text}
            </div>
          )}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            모든 데이터는 브라우저(LocalStorage)에 저장됩니다. 다른 기기/브라우저로 옮기려면 내보내기 → 불러오기 하세요.
          </p>
        </CardContent>
      </Card>

      {/* ─── 앱 정보 ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Info size={16} className="text-indigo-500" />
              앱 정보
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <InfoRow label="버전" value="1.0.0 (Glass UI)" />
          <InfoRow label="프로젝트" value="평촌학원가 차량 혼잡도 분석" />
          <InfoRow label="목적" value="학교 동아리 프로젝트" />
          <InfoRow label="지도 데이터" value="OpenStreetMap (오픈 라이선스)" />
          <InfoRow label="길찾기" value="OSRM (Open Source Routing Machine)" />
          <InfoRow label="프레임워크" value="Next.js 15 · React · Tailwind v4 · Leaflet" />
          <InfoRow label="아이콘" value="Lucide React" />
          <div className="flex items-center gap-2 pt-2 mt-1 border-t border-white/30 dark:border-white/10">
            <Github size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              오픈소스 라이선스 및 데이터 출처는 각 라이브러리 페이지를 참고하세요.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3 text-xs">
      <span className="text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-slate-800 dark:text-slate-200 text-right">{value}</span>
    </div>
  );
}
