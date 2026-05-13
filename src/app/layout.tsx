import type { Metadata } from "next";
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
      <head>
        {/*
          네이버 지도 SDK 로딩 — 순수 <script> 태그 사용.
          Next.js <Script> 컴포넌트는 동적 DOM 삽입 방식이라 Referer 헤더가
          누락/변경되어 네이버 인증 200(Authentication Failed) 이 발생함.
          정적 script 태그(테스트 HTML 동작 방식)로 처리해야 인증 통과.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__naverReady = function() {
                window.__naverMapsLoaded = true;
                window.dispatchEvent(new Event('naverReady'));
              };
            `,
          }}
        />
        <script src={naverMapSrc} async />
      </head>
      <body className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
