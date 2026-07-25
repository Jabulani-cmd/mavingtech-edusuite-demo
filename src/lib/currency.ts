// South African Rand (ZAR) formatting — single source of truth for currency display.
// The app is ZAR-native. Prices are stored in Rands in the same numeric columns
// previously used for USD (e.g. amount_usd) — no live FX conversion is performed.

export const CURRENCY_CODE = "ZAR";
export const CURRENCY_SYMBOL = "R";
export const COUNTRY = "South Africa";
export const CITY = "Johannesburg";

const nf = new Intl.NumberFormat("en-ZA", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfWhole = new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 });

/** Format a number as `R 1 234.56`. */
export function formatZAR(amount: number | string | null | undefined, opts?: { decimals?: boolean }): string {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return "R 0.00";
  return `R ${opts?.decimals === false ? nfWhole.format(n) : nf.format(n)}`;
}

/** Just the number formatted South-African style, no symbol. */
export function fmtZAR(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return nf.format(Number.isFinite(n) ? n : 0);
}
