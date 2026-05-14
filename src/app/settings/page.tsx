"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  Lock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSettings, ThemeMode } from "@/lib/context/SettingsContext";
import { AREAS } from "@/lib/constants/areas";
import { cn } from "@/lib/utils/cn";
import { dataStore } from "@/lib/storage";
import { CLUB_PASSWORD } from "@/lib/constants/auth";

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

  // 동아리원 비밀번호 게이트
  const router = useRouter();
  const [clubPwInput, setClubPwInput] = useState("");
  const [clubPwError, setClubPwError] = useState<string | null>(null);

  // 앱 정보 i 아이콘 클릭 → 개발자 크레딧 표시
  const [showCredit, setShowCredit] = useState(false);

  function handleClubAccess(e: React.FormEvent) {
    e.preventDefault();
    setClubPwError(null);
    if (clubPwInput === CLUB_PASSWORD) {
      router.push("/data-input");
    } else {
      setClubPwError("비밀번호가 일치하지 않습니다");
    }
  }

  async function handleExport() {
    try {
      const payload = await dataStore.exportAll();
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        ...payload,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pyeongchon-traffic-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setImportMsg({ ok: true, text: "백업 파일이 다운로드되었습니다." });
    } catch (e) {
      setImportMsg({ ok: false, text: "내보내기 실패: " + String(e) });
    }
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result ?? ""));
        await dataStore.importAll(data);
        setImportMsg({ ok: true, text: "복원 완료. 페이지를 새로고침하면 반영됩니다." });
      } catch {
        setImportMsg({ ok: false, text: "불러오기 실패: 잘못된 파일 형식" });
      }
    };
    reader.readAsText(file);
  }

  async function handleResetAll() {
    if (!confirm(
      "다음 데이터를 초기화합니다.\n\n" +
      "• 학원 시간표\n" +
      "• 앱 설정 (테마, 기본 구역, 가중치)\n\n" +
      "되돌릴 수 없습니다. 계속하시겠습니까?"
    )) return;
    try {
      await dataStore.clearUserData();
      resetAll();
      setImportMsg({ ok: true, text: "시간표·설정 초기화 완료. 새로고침하면 반영됩니다." });
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
            <Trash2 size={16} /> 시간표 · 설정 초기화
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
            현재 모든 데이터는 이 브라우저(localStorage)에만 저장됩니다.
            다른 기기로 옮기려면 내보내기 → 불러오기 하세요.
            추후 클라우드 DB 연결 시 자동 동기화될 예정입니다.
          </p>
        </CardContent>
      </Card>

      {/* ─── 앱 정보 — 리스트 스타일 ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCredit((v) => !v)}
                aria-label="개발자 정보"
                className="text-[var(--accent)] hover:opacity-70 transition-opacity"
              >
                <Info size={16} />
              </button>
              앱 정보
              {showCredit && (
                <span className="ml-auto text-[11px] font-medium text-[var(--text-muted)]">
                  개발: @eungyiu
                </span>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <InfoRow label="버전" value="1.2.0" />
          <InfoRow label="프로젝트" value="평촌학원가 차량 혼잡도 분석" />
          <InfoRow label="용도" value="학교 동아리 프로젝트" />
          <InfoRow label="지도 데이터" value="네이버 지도" />
          <InfoRow label="길찾기" value="NCP Directions 5" />
          <InfoRow label="위치 검색" value="NCP Geocoding" />
          <InfoRow label="저장소" value="브라우저 localStorage" />
          <InfoRow label="프레임워크" value="Next.js 15 · Tailwind v4" last />
        </CardContent>
      </Card>

      {/* ─── 동아리원 접근 ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Lock size={14} className="text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-muted)] font-medium">
                동아리원 접근
              </span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleClubAccess} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="password"
                value={clubPwInput}
                onChange={(e) => {
                  setClubPwInput(e.target.value);
                  setClubPwError(null);
                }}
                placeholder="비밀번호"
                className="input rounded-xl px-3 py-2 text-sm flex-1"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!clubPwInput}
                className="shrink-0"
              >
                입장
                <ArrowRight size={14} />
              </Button>
            </div>
            {clubPwError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold px-1">
                {clubPwError}
              </p>
            )}
            <p className="text-[10px] text-[var(--text-muted)] px-1 leading-relaxed">
              동아리원만 사용하는 조사 데이터 입력 페이지입니다.
            </p>
          </form>
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
