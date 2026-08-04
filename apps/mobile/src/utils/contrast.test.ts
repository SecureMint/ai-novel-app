import { describe, expect, it } from "vitest";
import { getContrastColor, relativeLuminance } from "./contrast";
describe("WebAIM contrast", () => {
  it("chooses readable foreground", () => {
    expect(getContrastColor("#ffffff").text).toBe("#171717");
    expect(getContrastColor("#101010").text).toBe("#ffffff");
  });
  it("computes luminance bounds", () => {
    expect(relativeLuminance("#000")).toBe(0);
    expect(relativeLuminance("#fff")).toBeCloseTo(1);
  });
});
