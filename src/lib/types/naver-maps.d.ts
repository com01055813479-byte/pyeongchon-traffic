/**
 * 네이버 지도 JavaScript API v3 최소 타입 선언
 * 실제로 사용하는 클래스/메서드만 선언합니다.
 */
declare namespace naver {
  namespace maps {
    // ── 지도 ──────────────────────────────────────────────
    class Map {
      constructor(element: HTMLElement | string, options?: MapOptions);
      setCenter(latlng: LatLng): void;
      setZoom(zoom: number): void;
      /** margin: 픽셀 숫자 또는 {top,right,bottom,left} */
      fitBounds(bounds: LatLngBounds, margin?: number | { top?: number; right?: number; bottom?: number; left?: number }): void;
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      mapTypeId?: string;
      zoomControl?: boolean;
      // zoomControlOptions는 Position/ZoomControlStyle 열거값을 쓰므로 생략
    }

    // ── 좌표 ──────────────────────────────────────────────
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(latlng: LatLng): void;
    }

    // ── 마커 ──────────────────────────────────────────────
    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      icon?: MarkerIcon;
      title?: string;
    }

    interface MarkerIcon {
      content?: string;
      anchor?: Point;
      size?: Size;
    }

    // ── 폴리라인 ──────────────────────────────────────────
    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
    }

    interface PolylineOptions {
      map?: Map;
      path: LatLng[];
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
      strokeStyle?: string;
    }

    // ── 기타 유틸 ─────────────────────────────────────────
    class Point {
      constructor(x: number, y: number);
    }

    class Size {
      constructor(width: number, height: number);
    }

    const Position: {
      TOP_LEFT: number;
      TOP_CENTER: number;
      TOP_RIGHT: number;
      BOTTOM_LEFT: number;
      BOTTOM_CENTER: number;
      BOTTOM_RIGHT: number;
    };

    const ZoomControlStyle: {
      LARGE: number;
      SMALL: number;
    };
  }
}

// window.naver 로 접근할 수 있도록 전역 선언
interface Window {
  naver: typeof naver;
}
