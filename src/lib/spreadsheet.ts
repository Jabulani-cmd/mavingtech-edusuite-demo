// Spreadsheet read/write on top of exceljs (replaces the unpatched `xlsx` package).
// Reads are size-limited and exports neutralise spreadsheet-formula injection.

export type Cell = string | number | boolean | Date | null | undefined;
export type SheetSpec = { name: string; rows: Cell[][]; colWidths?: number[] };

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 5000;

/** Text starting with = + - @ (or tab/CR) is run as a formula by Excel; prefix it so it stays text. */
export function neutraliseFormula(value: Cell): Cell {
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(value)) return `'${value}`;
  return value;
}

function plain(v: unknown): unknown {
  if (v && typeof v === "object" && !(v instanceof Date)) {
    const o = v as { text?: unknown; result?: unknown; richText?: { text: string }[] };
    if (Array.isArray(o.richText)) return o.richText.map((t) => t.text).join("");
    if (o.text !== undefined) return o.text;
    if (o.result !== undefined) return o.result;
    return "";
  }
  return v ?? "";
}

/** Parse the first sheet of an .xlsx or .csv file into header-keyed row objects. */
export async function readFirstSheet(file: File): Promise<Record<string, unknown>[]> {
  if (file.size > MAX_IMPORT_BYTES) throw new Error("File is too large (max 5 MB).");
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter((l) => l.trim() !== "").map(parseCsvLine);
    return rowsToObjects(rows);
  }
  if (!name.endsWith(".xlsx")) throw new Error("Unsupported file type. Upload .xlsx or .csv.");
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) return [];
  const rows: unknown[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    if (rows.length > MAX_IMPORT_ROWS) return;
    rows.push((row.values as unknown[]).slice(1).map(plain));
  });
  return rowsToObjects(rows);
}

function rowsToObjects(rows: unknown[][]): Record<string, unknown>[] {
  if (rows.length === 0) return [];
  if (rows.length > MAX_IMPORT_ROWS + 1) throw new Error(`Too many rows (max ${MAX_IMPORT_ROWS}).`);
  const headers = rows[0].map((h) => String(h ?? "").trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, unknown> = Object.create(null);
    headers.forEach((h, i) => {
      if (h && h !== "__proto__" && h !== "constructor" && h !== "prototype") obj[h] = r[i] ?? "";
    });
    return { ...obj };
  });
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

/** Build an .xlsx from sheets and trigger a browser download. */
export async function downloadWorkbook(filename: string, sheets: SheetSpec[]): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31));
    for (const r of s.rows) ws.addRow(r.map(neutraliseFormula));
    s.colWidths?.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  }
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Re-serialise CSV text so no field can be executed as a spreadsheet formula (plain numbers are left alone). */
export function sanitizeCsv(text: string): string {
  let out = "";
  let field = "";
  let quoted = false;
  let inQuotes = false;
  const flush = () => {
    const raw = field;
    const risky = /^[=+\-@\t\r]/.test(raw) && !/^[+-]?\d+(\.\d+)?$/.test(raw);
    const val = risky ? `'${raw}` : raw;
    out += quoted ? `"${val.replace(/"/g, '""')}"` : val;
    field = "";
    quoted = false;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"' && field === "") { inQuotes = true; quoted = true; }
    else if (c === ",") { flush(); out += ","; }
    else if (c === "\n") { flush(); out += "\n"; }
    else field += c;
  }
  flush();
  return out;
}

export const csvBlob = (csv: string) => new Blob([sanitizeCsv(csv)], { type: "text/csv" });
