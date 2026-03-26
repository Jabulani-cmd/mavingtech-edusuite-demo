import { describe, it, expect } from "vitest";

// ZIMSEC grade boundary calculation (standard)
function getZIMSECGrade(percentage: number): string {
  if (percentage >= 90) return "A*";
  if (percentage >= 75) return "A";
  if (percentage >= 65) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  if (percentage >= 30) return "E";
  return "U";
}

function calculatePassRate(marks: number[], passThreshold = 50): number {
  if (marks.length === 0) return 0;
  const passed = marks.filter((m) => m >= passThreshold).length;
  return Math.round((passed / marks.length) * 100);
}

function calculateClassAverage(marks: number[]): number {
  if (marks.length === 0) return 0;
  return Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 100) / 100;
}

function calculateFeeBalance(totalUsd: number, paidUsd: number): number {
  return Math.round((totalUsd - paidUsd) * 100) / 100;
}

function calculateCollectionRate(totalDue: number, totalPaid: number): number {
  if (totalDue === 0) return 0;
  return Math.round((totalPaid / totalDue) * 100);
}

describe("ZIMSEC Grade Boundaries", () => {
  it("assigns A* for 90+", () => {
    expect(getZIMSECGrade(95)).toBe("A*");
    expect(getZIMSECGrade(90)).toBe("A*");
  });

  it("assigns A for 75-89", () => {
    expect(getZIMSECGrade(75)).toBe("A");
    expect(getZIMSECGrade(89)).toBe("A");
  });

  it("assigns B for 65-74", () => {
    expect(getZIMSECGrade(65)).toBe("B");
    expect(getZIMSECGrade(74)).toBe("B");
  });

  it("assigns C for 50-64", () => {
    expect(getZIMSECGrade(50)).toBe("C");
    expect(getZIMSECGrade(64)).toBe("C");
  });

  it("assigns D for 40-49", () => {
    expect(getZIMSECGrade(40)).toBe("D");
    expect(getZIMSECGrade(49)).toBe("D");
  });

  it("assigns E for 30-39", () => {
    expect(getZIMSECGrade(30)).toBe("E");
    expect(getZIMSECGrade(39)).toBe("E");
  });

  it("assigns U for below 30", () => {
    expect(getZIMSECGrade(29)).toBe("U");
    expect(getZIMSECGrade(0)).toBe("U");
  });
});

describe("Pass Rate Calculation", () => {
  it("calculates 100% when all pass", () => {
    expect(calculatePassRate([80, 70, 60, 55])).toBe(100);
  });

  it("calculates 0% when none pass", () => {
    expect(calculatePassRate([20, 30, 10, 45])).toBe(0);
  });

  it("calculates correctly for mixed results", () => {
    expect(calculatePassRate([80, 30, 60, 40])).toBe(50);
  });

  it("handles empty array", () => {
    expect(calculatePassRate([])).toBe(0);
  });

  it("uses custom threshold", () => {
    expect(calculatePassRate([35, 45, 55], 40)).toBe(67);
  });
});

describe("Class Average", () => {
  it("calculates correctly", () => {
    expect(calculateClassAverage([60, 70, 80])).toBe(70);
  });

  it("handles single student", () => {
    expect(calculateClassAverage([85])).toBe(85);
  });

  it("handles empty", () => {
    expect(calculateClassAverage([])).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    expect(calculateClassAverage([33, 33, 34])).toBe(33.33);
  });
});

describe("Fee Calculations", () => {
  it("calculates outstanding balance", () => {
    expect(calculateFeeBalance(1500, 800)).toBe(700);
  });

  it("shows zero when fully paid", () => {
    expect(calculateFeeBalance(1500, 1500)).toBe(0);
  });

  it("shows negative (overpayment/credit)", () => {
    expect(calculateFeeBalance(1500, 1600)).toBe(-100);
  });

  it("handles decimal amounts", () => {
    expect(calculateFeeBalance(1500.50, 750.25)).toBe(750.25);
  });
});

describe("Fee Collection Rate", () => {
  it("calculates percentage correctly", () => {
    expect(calculateCollectionRate(10000, 7500)).toBe(75);
  });

  it("handles full collection", () => {
    expect(calculateCollectionRate(10000, 10000)).toBe(100);
  });

  it("handles zero due", () => {
    expect(calculateCollectionRate(0, 0)).toBe(0);
  });
});
