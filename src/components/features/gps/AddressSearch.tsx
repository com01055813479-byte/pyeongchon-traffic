"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UserLocation } from "@/lib/types";

interface GeocodeResult {
  roadAddress:  string;
  jibunAddress: string;
  lat: number;
  lng: number;
}

interface Props {
  onSelect: (loc: UserLocation, label: string) => void;
}

export function AddressSearch({ onSelect }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<GeocodeResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res  = await fetch(`/api/geocode?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "위치 검색 실패");

      setResults(data.addresses ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  function handlePick(r: GeocodeResult) {
    onSelect(
      { lat: r.lat, lng: r.lng, accuracy: 0, timestamp: Date.now() },
      r.roadAddress || r.jibunAddress
    );
    setResults([]);
    setSearched(false);
    setQuery(r.roadAddress || r.jibunAddress);
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="주소 또는 장소명 검색 (예: 평촌역)"
          className="input rounded-xl px-3 py-2.5 text-sm flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()} className="shrink-0">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          검색
        </Button>
      </form>

      {error && (
        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {searched && results.length === 0 && !loading && !error && (
        <p className="text-xs text-[var(--text-muted)] px-1">검색 결과가 없습니다.</p>
      )}

      {results.length > 0 && (
        <ul className="card rounded-xl divide-y divide-[var(--border)] overflow-hidden">
          {results.slice(0, 5).map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handlePick(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-[var(--bg-soft)] transition-colors flex items-start gap-2"
              >
                <MapPin size={14} className="mt-0.5 text-[var(--accent)] shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0">
                  {r.roadAddress && (
                    <span className="text-sm font-medium text-[var(--text-strong)] truncate">
                      {r.roadAddress}
                    </span>
                  )}
                  {r.jibunAddress && r.jibunAddress !== r.roadAddress && (
                    <span className="text-xs text-[var(--text-muted)] truncate">
                      {r.jibunAddress}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
