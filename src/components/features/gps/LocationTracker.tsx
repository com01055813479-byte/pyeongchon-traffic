"use client";

import { useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UserLocation } from "@/lib/types";

interface Props {
  onLocation: (loc: UserLocation) => void;
}

type State = "idle" | "loading" | "success" | "error";

export function LocationTracker({ onLocation }: Props) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [location, setLocation] = useState<UserLocation | null>(null);

  function requestLocation() {
    if (!navigator.geolocation) {
      setState("error");
      setErrorMsg("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      return;
    }

    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setLocation(loc);
        setState("success");
        onLocation(loc);
      },
      (err) => {
        setState("error");
        setErrorMsg(err.message || "위치를 가져오지 못했습니다.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant={state === "success" ? "secondary" : "primary"}
        onClick={requestLocation}
        disabled={state === "loading"}
      >
        {state === "loading" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <MapPin size={16} />
        )}
        {state === "idle" && "내 위치 확인"}
        {state === "loading" && "위치 확인 중..."}
        {state === "success" && "위치 확인됨"}
        {state === "error" && "다시 시도"}
      </Button>

      {state === "success" && location && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          <p className="font-bold">위치 확인 완료</p>
          <p className="text-xs opacity-80 mt-0.5">
            위도 {location.lat.toFixed(5)}, 경도 {location.lng.toFixed(5)} (정확도 {Math.round(location.accuracy)}m)
          </p>
        </div>
      )}

      {state === "error" && (
        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
