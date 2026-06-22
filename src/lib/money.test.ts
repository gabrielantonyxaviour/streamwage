import { describe, expect, it } from "vitest";
import { hourlyCusdToRatePerSecond, formatShortAddress } from "./money";

describe("money helpers", () => {
  it("converts an hourly cUSD wage into a per-second onchain rate", () => {
    expect(hourlyCusdToRatePerSecond("3.6")).toBe(1_000_000_000_000_000n);
  });

  it("formats wallet addresses for dense mobile panels", () => {
    expect(formatShortAddress("0xd5E79f200cbe03141F81566dc213a46135f83062")).toBe(
      "0xd5E7...3062",
    );
  });
});
