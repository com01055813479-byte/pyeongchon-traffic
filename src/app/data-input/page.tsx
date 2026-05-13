"use client";

import { useState } from "react";
import { ClipboardList, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataInputForm } from "@/components/features/data/DataInputForm";
import { DataTable } from "@/components/features/data/DataTable";
import { Button } from "@/components/ui/Button";
import { SAMPLE_RECORDS } from "@/data/sampleData";
import type { SurveyRecord } from "@/lib/types";

export default function DataInputPage() {
  const [records, setRecords] = useState<SurveyRecord[]>(SAMPLE_RECORDS);

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

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">현장 조사 데이터 입력</h1>
            <p className="text-sm text-gray-500">시간대별 차량 수 현장 조사 결과를 입력합니다</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          <Download size={14} />
          CSV 내보내기
        </Button>
      </div>

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
