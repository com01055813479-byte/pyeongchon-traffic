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
      {/* suppressHydrationWarning: Script 태그로 인한 SSR/CSR 텍스트 불일치 억제 */}
      <body suppressHydrationWarning className="min-h-screen bg-slate-50">
        <Script
          id="naver-callback"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.__naverReady=function(){window.__naverMapsLoaded=true;window.dispatchEvent(new Event('naverReady'));};`,
          }}
        />
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
