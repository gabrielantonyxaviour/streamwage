import { describe, expect, it } from "vitest";
import {
  monthlyToRatePerSecond,
  ratePerSecondToMonthly,
  shortAddr,
  toNumber,
} from "./format";

describe("format helpers", () => {
  it("round-trips monthly cUSD <-> per-second rate", () => {
    const rate = monthlyToRatePerSecond(3000);
    const monthly = ratePerSecondToMonthly(rate);
    expect(Math.round(monthly)).toBe(3000);
  });

  it("produces a positive per-second rate", () => {
    expect(monthlyToRatePerSecond(1000) > 0n).toBe(true);
  });

  it("shortens addresses", () => {
    expect(shortAddr("0xd5E79f200cbe03141F81566dc213a46135f83062")).toBe(
      "0xd5E7…3062",
    );
  });

  it("converts 18-decimal bigint to a number", () => {
    expect(toNumber(1_000_000_000_000_000_000n)).toBe(1);
  });
});
