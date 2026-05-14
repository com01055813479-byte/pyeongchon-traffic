import { NextResponse } from "next/server";

/**
 * GET /api/directions?startLat=&startLng=&goalLat=&goalLng=
 *
 * 네이버 Cloud Platform Directions 5 (driving) API 호출.
 * - Endpoint: https://maps.apigw.ntruss.com/map-direction/v1/driving
 * - 요구 헤더: X-NCP-APIGW-API-KEY-ID, X-NCP-APIGW-API-KEY
 *
 * 응답 (성공):
 *   { distance: meters, duration: milliseconds, path: [[lng, lat], ...] }
 */
const CLIENT_ID     = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET ?? "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const startLat = searchParams.get("startLat");
  const startLng = searchParams.get("startLng");
  const goalLat  = searchParams.get("goalLat");
  const goalLng  = searchParams.get("goalLng");

  if (!startLat || !startLng || !goalLat || !goalLng) {
    return NextResponse.json(
      { error: "startLat, startLng, goalLat, goalLng 파라미터가 필요합니다." },
      { status: 400 }
    );
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: "네이버 API 키 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  // 네이버 좌표 순서: 경도,위도
  const start = `${startLng},${startLat}`;
  const goal  = `${goalLng},${goalLat}`;
  const apiUrl =
    `https://maps.apigw.ntruss.com/map-direction/v1/driving` +
    `?start=${start}&goal=${goal}&option=trafast`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": CLIENT_ID,
        "X-NCP-APIGW-API-KEY":    CLIENT_SECRET,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.code !== 0) {
      console.error("[Directions API] 네이버 응답 오류:", { status: res.status, data });
      return NextResponse.json(
        {
          error: data?.message ?? `경로 서비스 오류 (${res.status})`,
          code:  data?.code,
          detail: data,
        },
        { status: res.status === 200 ? 502 : res.status }
      );
    }

    // 네이버 응답 구조: route.trafast[0].{ summary, path }
    const route = data?.route?.trafast?.[0];
    if (!route) {
      return NextResponse.json(
        { error: "경로를 찾을 수 없습니다.", raw: data },
        { status: 404 }
      );
    }

    return NextResponse.json({
      distance: route.summary.distance, // 미터
      duration: route.summary.duration, // 밀리초 (네이버는 ms 단위)
      path:     route.path,             // [[lng, lat], ...]
    });
  } catch (err) {
    console.error("[Directions API] 네트워크 오류:", err);
    return NextResponse.json(
      { error: "네트워크 오류가 발생했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
