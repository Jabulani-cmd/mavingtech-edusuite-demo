import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SETTING_KEY = "usd_zig_exchange_rate";
const DEFAULT_RATE = 1;

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(DEFAULT_RATE);
  const [loading, setLoading] = useState(true);

  const fetchRate = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", SETTING_KEY)
      .maybeSingle();
    if (data) setRate(parseFloat(data.setting_value) || DEFAULT_RATE);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  const updateRate = async (newRate: number) => {
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("setting_key", SETTING_KEY);

    if (existing && existing.length > 0) {
      await supabase
        .from("site_settings")
        .update({ setting_value: String(newRate), updated_at: new Date().toISOString() })
        .eq("setting_key", SETTING_KEY);
    } else {
      await supabase
        .from("site_settings")
        .insert({ setting_key: SETTING_KEY, setting_value: String(newRate) });
    }
    setRate(newRate);
  };

  const usdToZig = (usd: number) => usd * rate;
  const zigToUsd = (zig: number) => rate > 0 ? zig / rate : 0;

  return { rate, loading, updateRate, usdToZig, zigToUsd, refetch: fetchRate };
}
