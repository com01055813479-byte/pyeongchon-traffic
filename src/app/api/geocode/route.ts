import { NextResponse } from "next/server";

/**
 * GET /api/geocode?query=강남역
 *
 * 네이버 Cloud Platform Geocoding API.
 * 응답:
 *   { addresses: [{ roadAddress, jibunAddress, lat, lng }, ...] }
 */
const CLIENT_ID     = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET ?? "";

interface NaverAddress {
  roadAddress: string;
  jibunAddress: string;
  x: string; // 경도
  y: string; // 위도
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "query 파라미터가 필요합니다." }, { status: 400 });
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: "네이버 API 키 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const apiUrl =
    `https://maps.apigw.ntruss.com/map-geocode/v2/geocode` +
    `?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": CLIENT_ID,
        "X-NCP-APIGW-API-KEY":    CLIENT_SECRET,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.status !== "OK") {
      console.error("[Geocoding API] 네이버 응답 오류:", { status: res.status, data });
      return NextResponse.json(
        { error: data?.errorMessage ?? `위치 검색 오류 (${res.status})`, detail: data },
        { status: res.status === 200 ? 502 : res.status }
      );
    }

    const addresses = (data.addresses as NaverAddress[] | undefined) ?? [];
    return NextResponse.json({
      addresses: addresses.map((a) => ({
        roadAddress:  a.roadAddress,
        jibunAddress: a.jibunAddress,
        lat: parseFloat(a.y),
        lng: parseFloat(a.x),
      })),
    });
  } catch (err) {
    console.error("[Geocoding API] 네트워크 오류:", err);
    return NextResponse.json(
      { error: "네트워크 오류가 발생했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
