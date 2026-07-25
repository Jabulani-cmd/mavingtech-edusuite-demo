import { describe, it, expect } from "vitest";

// CAPS 7-point rating code (South African NSC/CAPS scale)
function getCAPSCode(percentage: number): number {
  if (percentage >= 80) return 7; // Outstanding achievement
  if (percentage >= 70) return 6; // Meritorious achievement
  if (percentage >= 60) return 5; // Substantial achievement
  if (percentage >= 50) return 4; // Adequate achievement
  if (percentage >= 40) return 3; // Moderate achievement
  if (percentage >= 30) return 2; // Elementary achievement
  return 1;                       // Not achieved
}

describe("CAPS Rating Codes", () => {
  it("returns 7 for 80–100%", () => {
    expect(getCAPSCode(95)).toBe(7);
    expect(getCAPSCode(80)).toBe(7);
  });
  it("returns 6 for 70–79%", () => {
    expect(getCAPSCode(75)).toBe(6);
    expect(getCAPSCode(70)).toBe(6);
  });
  it("returns 5 for 60–69%", () => {
    expect(getCAPSCode(65)).toBe(5);
  });
  it("returns 4 for 50–59%", () => {
    expect(getCAPSCode(50)).toBe(4);
  });
  it("returns 3 for 40–49%", () => {
    expect(getCAPSCode(45)).toBe(3);
  });
  it("returns 2 for 30–39%", () => {
    expect(getCAPSCode(35)).toBe(2);
  });
  it("returns 1 for below 30%", () => {
    expect(getCAPSCode(29)).toBe(1);
    expect(getCAPSCode(0)).toBe(1);
  });
});
