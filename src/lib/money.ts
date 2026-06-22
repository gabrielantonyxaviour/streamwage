import { parseUnits } from "viem";

export function hourlyCusdToRatePerSecond(hourlyRate: string) {
  return parseUnits(hourlyRate || "0", 18) / 3600n;
}

export function formatShortAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
