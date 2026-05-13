import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "평촌학원가 혼잡도 분석",
  description: "평촌학원가 시간대별 차량 혼잡도 분석 및 최적 픽업 시간 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const naverMapSrc = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&callback=__naverReady`;

  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50">
        {/*
          네이버 지도 SDK 로딩.
          strategy="beforeInteractive" 는 SSR 시점에 <head>로 인라인되어
          정적 <script> 태그처럼 동작 → Referer 정상 전송 + hydration 오류 없음.
        */}
        <Script
          id="naver-callback"
          strategy="beforeInteractive"
        >
          {`window.__naverReady = function() {
              window.__naverMapsLoaded = true;
              window.dispatchEvent(new Event('naverReady'));
            };`}
        </Script>
        <Script
          id="naver-maps-sdk"
          src={naverMapSrc}
          strategy="beforeInteractive"
        />

        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
