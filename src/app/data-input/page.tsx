"use client";

import { useState } from "react";
import { ClipboardList, Download, Trash2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataInputForm } from "@/components/features/data/DataInputForm";
import { DataTable } from "@/components/features/data/DataTable";
import { Button } from "@/components/ui/Button";
import { SAMPLE_RECORDS } from "@/data/sampleData";
import { dataStore } from "@/lib/storage";
import type { SurveyRecord } from "@/lib/types";

export default function DataInputPage() {
  const [records, setRecords] = useState<SurveyRecord[]>(SAMPLE_RECORDS);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  function handleAdd(data: Omit<SurveyRecord, "id" | "createdAt">) {
    const newRecord: SurveyRecord = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  }

  function handleDelete(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function handleExportCSV() {
    const header = "날짜,시간대,구역ID,차량수,날씨,메모,등록일시";
    const rows = records.map(
      (r) =>
        `${r.date},${r.timeSlot},${r.areaId},${r.carCount},${r.weather},${r.note ?? ""},${r.createdAt}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pyeongchon_survey_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleResetSurvey() {
    if (!confirm(
      "조사 데이터를 모두 삭제하고 샘플 데이터로 되돌립니다.\n" +
      "(시간표 / 앱 설정은 영향받지 않습니다)\n\n" +
      "되돌릴 수 없습니다. 계속하시겠습니까?"
    )) return;
    try {
      await dataStore.clearSurveyData();
      setRecords(SAMPLE_RECORDS);
      setResetMsg("조사 데이터 초기화 완료. 샘플 데이터로 돌아갔습니다.");
      setTimeout(() => setResetMsg(null), 4000);
    } catch {
      setResetMsg("초기화 실패");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 동아리원 전용 안내 */}
      <div
        className="rounded-2xl px-4 py-3 flex items-start gap-2 text-sm"
        style={{
          backgroundColor: "var(--accent-soft)",
          color: "var(--accent-text)",
        }}
      >
        <Lock size={14} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">동아리원 전용 페이지</p>
          <p className="text-xs opacity-80 mt-0.5">
            이 페이지는 메뉴에 노출되지 않습니다. 동아리원은 URL을 직접 입력해 접근하세요.
          </p>
        </div>
      </div>

      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="pt-2 pb-1">
          <p className="text-sm text-[var(--text-muted)] mb-1 flex items-center gap-1.5">
            <ClipboardList size={14} />
            현장 조사
          </p>
          <h1 className="text-2xl font-bold text-[var(--text-strong)] leading-tight">
            차량 수 데이터 입력
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            시간대별 현장 조사 결과를 입력하면 혼잡도 분석에 반영됩니다.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download size={14} />
            CSV
          </Button>
          <Button variant="danger" size="sm" onClick={handleResetSurvey}>
            <Trash2 size={14} />
            조사 초기화
          </Button>
        </div>
      </div>

      {resetMsg && (
        <div className="text-xs px-3 py-2.5 rounded-lg font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          {resetMsg}
        </div>
      )}

      {/* 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 조사 데이터 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <DataInputForm onAdd={handleAdd} />
        </CardContent>
      </Card>

      {/* 데이터 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>입력된 데이터 ({records.length}건)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable records={records} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
