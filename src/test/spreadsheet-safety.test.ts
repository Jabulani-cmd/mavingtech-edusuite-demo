import { describe, it, expect } from "vitest";
import { neutraliseFormula, sanitizeCsv } from "@/lib/spreadsheet";

describe("spreadsheet formula injection", () => {
  it("prefixes formula-looking text", () => {
    expect(neutraliseFormula("=HYPERLINK(\"http://x\")")).toBe("'=HYPERLINK(\"http://x\")");
    expect(neutraliseFormula("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(neutraliseFormula("Tendai")).toBe("Tendai");
    expect(neutraliseFormula(42)).toBe(42);
  });
  it("sanitises CSV fields but keeps numbers and quoting", () => {
    expect(sanitizeCsv('Name,Mark\n"=cmd|x",-5\nAnn,+3.5\n"Smith, J",@x')).toBe('Name,Mark\n"\'=cmd|x",-5\nAnn,+3.5\n"Smith, J",\'@x');
  });
});
