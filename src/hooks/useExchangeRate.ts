// @ts-nocheck
// ZAR-only build: exchange-rate hook is now a no-op passthrough kept for API
// compatibility. All monetary values are already stored and displayed in Rands (R).
import { useCallback } from "react";

export function useExchangeRate() {
  const rate = 1;
  const loading = false;

  const fetchRate = useCallback(async () => 1, []);
  const updateRate = async (_newRate: number) => {
    // ZAR is the base currency — no conversion is applied.
    return;
  };

  const usdToZig = (v: number) => v; // legacy name preserved
  const zigToUsd = (v: number) => v;

  return { rate, loading, updateRate, usdToZig, zigToUsd, refetch: fetchRate };
}
