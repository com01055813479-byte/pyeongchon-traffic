import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { SettingsProvider, themeInlineScript } from "@/lib/context/SettingsContext";

export const metadata: Metadata = {
  title: "평촌학원가 혼잡도 분석",
  description: "평촌학원가 시간대별 차량 혼잡도 분석 및 최적 픽업 시간 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 초기 페인트 전에 .dark 클래스 적용 → FOUC/하이드레이션 미스매치 방지 */}
        <script dangerouslySetInnerHTML={{ __html: themeInlineScript }} />
      </head>
      <body className="min-h-screen">
        <SettingsProvider>
          <Header />
          <main className="max-w-2xl mx-auto px-4 py-5 pb-20">{children}</main>
        </SettingsProvider>
      </body>
    </html>
  );
}
