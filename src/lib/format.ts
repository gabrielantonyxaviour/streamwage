// Display + math helpers for cUSD-denominated payroll streams.

const SECONDS_PER_MONTH = 30 * 24 * 3600;

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 1000 ? 0 : 2,
  }).format(value);
}

export function formatCusd(value: number, maxFrac?: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFrac ?? (value > 1000 ? 0 : 2),
  }).format(value)} cUSD`;
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Convert a fixed-point (18-decimal) bigint to a number, safely.
export function toNumber(v: bigint | undefined, decimals = 18): number {
  if (v === undefined) return 0;
  return Number(v) / 10 ** decimals;
}

// Format an 18-decimal bigint with a fixed number of fractional digits.
export function fmtUnits(v: bigint | undefined, frac = 2): string {
  if (v === undefined) return "—";
  const whole = v / 10n ** 18n;
  if (frac === 0) return whole.toLocaleString();
  const f = (v % 10n ** 18n)
    .toString()
    .padStart(18, "0")
    .slice(0, frac);
  return `${whole.toLocaleString()}.${f}`;
}

// Monthly cUSD salary -> per-second rate (wei). 18-decimal token.
export function monthlyToRatePerSecond(monthlyCusd: number): bigint {
  // scale by 1e6 to keep precision on fractional monthly amounts
  return (
    (BigInt(Math.floor(monthlyCusd * 1e6)) * 10n ** 12n) /
    BigInt(SECONDS_PER_MONTH)
  );
}

// Per-second rate (wei) -> monthly cUSD (rounded, for display).
export function ratePerSecondToMonthly(ratePerSec: bigint): number {
  return (Number(ratePerSec) * SECONDS_PER_MONTH) / 1e18;
}
