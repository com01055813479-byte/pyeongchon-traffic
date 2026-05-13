import { NextResponse } from "next/server";

/**
 * GET /api/directions?startLat=&startLng=&goalLat=&goalLng=
 *
 * 네이버 Directions 5 API를 서버에서 호출합니다.
 * Client Secret은 서버에서만 사용하며 브라우저에 노출되지 않습니다.
 */
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

  const clientId     = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "서버에 API 키가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  // 네이버 Directions API: 좌표 순서가 "경도,위도" 임에 주의
  const start = `${startLng},${startLat}`;
  const goal  = `${goalLng},${goalLat}`;

  // Directions 15 (신버전) endpoint. 구버전(map-direction)에서 5는 점차 종료되는 추세라 15 사용.
  const apiUrl =
    `https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving` +
    `?start=${start}&goal=${goal}&option=traoptimal`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY":    clientSecret,
      },
      // Next.js fetch는 기본으로 캐시하므로 실시간 데이터는 no-store
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      // 서버 콘솔(PowerShell)에 실제 네이버 응답 출력 → 권한 진단용
      console.error("[Directions API] 네이버 응답:", {
        status:      res.status,
        body:        text,
        usedKeyId:   clientId,
        keyTail:     clientSecret.slice(-4), // 마지막 4자만 비교용
      });
      return NextResponse.json(
        { error: `네이버 API 오류 (${res.status})`, detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();

    // 성공 시 필요한 값만 추출해서 반환
    const route = data?.route?.traoptimal?.[0];
    if (!route) {
      return NextResponse.json(
        { error: "경로를 찾을 수 없습니다.", raw: data },
        { status: 404 }
      );
    }

    return NextResponse.json({
      distance: route.summary.distance,          // 미터
      duration: route.summary.duration,          // 밀리초
      path: route.path,                          // [[lng, lat], ...] 경로 좌표 배열
    });
  } catch (err) {
    return NextResponse.json(
      { error: "네트워크 오류가 발생했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
