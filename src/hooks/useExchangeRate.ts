// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_RATE = 1;

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(DEFAULT_RATE);
  const [loading, setLoading] = useState(true);

  const fetchRate = useCallback(async () => {
    const { data } = await supabase
      .from("exchange_rates")
      .select("usd_to_zwg")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.usd_to_zwg) setRate(parseFloat(String(data.usd_to_zwg)) || DEFAULT_RATE);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRate();
    const channel = supabase
      .channel(`exchange-rate-sync-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exchange_rates" },
        () => { fetchRate(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRate]);

  const updateRate = async (newRate: number) => {
    // Deactivate previous active rates, then insert a new active one
    await supabase.from("exchange_rates").update({ is_active: false }).eq("is_active", true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("exchange_rates").insert({
      usd_to_zwg: newRate,
      source: "manual",
      is_active: true,
      set_by_admin: userData?.user?.id ?? null,
    });
    if (error) throw error;
    setRate(newRate);
  };

  const usdToZig = (usd: number) => usd * rate;
  const zigToUsd = (zig: number) => (rate > 0 ? zig / rate : 0);

  return { rate, loading, updateRate, usdToZig, zigToUsd, refetch: fetchRate };
}
