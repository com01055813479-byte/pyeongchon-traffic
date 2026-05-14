import { NextResponse } from "next/server";

/**
 * GET /api/directions?startLat=&startLng=&goalLat=&goalLng=
 *
 * OSRM(Open Source Routing Machine) 공개 데모 서버를 통해 차량 경로를 조회합니다.
 * API 키 / 도메인 등록 불필요 → 즉시 사용 가능.
 *
 * 응답:
 *   { distance: meters, duration: milliseconds, path: [[lng, lat], ...] }
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

  // OSRM 좌표 순서: 경도,위도 (Naver 와 동일)
  const start = `${startLng},${startLat}`;
  const goal  = `${goalLng},${goalLat}`;

  const apiUrl =
    `https://router.project-osrm.org/route/v1/driving/${start};${goal}` +
    `?overview=full&geometries=geojson`;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Directions API] OSRM 응답:", { status: res.status, body: text });
      return NextResponse.json(
        { error: `경로 서비스 오류 (${res.status})`, detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();

    const route = data?.routes?.[0];
    if (!route) {
      return NextResponse.json(
        { error: "경로를 찾을 수 없습니다.", raw: data },
        { status: 404 }
      );
    }

    // OSRM 응답: distance(m), duration(seconds), geometry.coordinates([[lng,lat], ...])
    return NextResponse.json({
      distance: route.distance,                 // 미터
      duration: Math.round(route.duration * 1000), // 밀리초로 통일 (기존 인터페이스 호환)
      path: route.geometry?.coordinates ?? [],  // [[lng, lat], ...]
    });
  } catch (err) {
    console.error("[Directions API] 네트워크 오류:", err);
    return NextResponse.json(
      { error: "네트워크 오류가 발생했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
