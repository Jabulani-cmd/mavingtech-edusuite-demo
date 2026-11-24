// Builds official class registers (attendance, marks, class list) as tables
// that can be printed, saved as PDF or exported to CSV for filing/evidence.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SCHOOL_LOGO_URL, SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_PHONE_EMAIL_LINE, urlToDataUrl } from "@/lib/finance/pdf";
import { buildBrandedHtml } from "@/lib/print/printSection";

export interface RegisterStudent { id: string; full_name: string; admission_number?: string | null; gender?: string | null; guardian_name?: string | null; guardian_phone?: string | null; subject_combination?: string | null }
export interface RegisterAttendance { student_id: string | null; date: string; status: string }
export interface RegisterMark { student_id: string | null; subject_id: string | null; mark: number; out_of: number | null }
export interface RegisterTable { head: string[]; body: (string | number)[][] }

const CODE: Record<string, string> = { present: "P", absent: "A", late: "L", excused: "E" };

export function attendanceRegister(students: RegisterStudent[], records: RegisterAttendance[]): RegisterTable {
  const dates = [...new Set(records.map(r => r.date))].sort();
  const map = new Map(records.map(r => [`${r.student_id}|${r.date}`, r.status]));
  const sorted = [...students].sort((a, b) => a.full_name.localeCompare(b.full_name));
  const body = sorted.map((s, i) => {
    const cells = dates.map(d => CODE[map.get(`${s.id}|${d}`) || ""] || "-");
    const count = (c: string) => cells.filter(x => x === c).length;
    const marked = cells.filter(x => x !== "-").length;
    const pct = marked ? Math.round(((count("P") + count("L")) / marked) * 100) : 0;
    return [i + 1, s.full_name, s.admission_number || "", ...cells, count("P"), count("A"), count("L"), count("E"), marked ? `${pct}%` : "-"];
  });
  const head = ["#", "Learner", "Adm No.", ...dates.map(d => d.slice(8, 10) + "/" + d.slice(5, 7)), "P", "A", "L", "E", "Rate"];
  return { head, body };
}

export function marksRegister(students: RegisterStudent[], marks: RegisterMark[], subjectNames: Record<string, string>): RegisterTable {
  const subjectIds = [...new Set(marks.map(m => m.subject_id).filter(Boolean) as string[])]
    .sort((a, b) => (subjectNames[a] || "").localeCompare(subjectNames[b] || ""));
  const sorted = [...students].sort((a, b) => a.full_name.localeCompare(b.full_name));
  const body = sorted.map((s, i) => {
    const avgs = subjectIds.map(sub => {
      const ms = marks.filter(m => m.student_id === s.id && m.subject_id === sub);
      if (!ms.length) return null;
      return Math.round(ms.reduce((t, m) => t + (m.mark / (m.out_of || 100)) * 100, 0) / ms.length);
    });
    const got = avgs.filter((x): x is number => x !== null);
    const overall = got.length ? Math.round(got.reduce((a, b) => a + b, 0) / got.length) : null;
    return [i + 1, s.full_name, s.admission_number || "", ...avgs.map(a => (a === null ? "-" : `${a}%`)), overall === null ? "-" : `${overall}%`];
  });
  return { head: ["#", "Learner", "Adm No.", ...subjectIds.map(id => subjectNames[id] || "Subject"), "Average"], body };
}

export function classList(students: RegisterStudent[]): RegisterTable {
  const sorted = [...students].sort((a, b) => a.full_name.localeCompare(b.full_name));
  return {
    head: ["#", "Learner", "Adm No.", "Gender", "Guardian", "Guardian phone", "Subjects"],
    body: sorted.map((s, i) => [i + 1, s.full_name, s.admission_number || "", s.gender || "", s.guardian_name || "", s.guardian_phone || "", s.subject_combination || ""]),
  };
}

const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function registerHtml(title: string, subtitle: string, t: RegisterTable, legend?: string) {
  const table = `<table><thead><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${
    t.body.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const sign = `<p style="margin-top:40px">Class teacher: ______________________ &nbsp; Signature: ____________ &nbsp; Date: ____________</p><p style="margin-top:24px">Head / Deputy: ______________________ &nbsp; Signature: ____________ &nbsp; School stamp:</p>`;
  return buildBrandedHtml({ title, subtitle, bodyHtml: `<style>@page{size:A4 landscape;margin:10mm}td,th{font-size:10px!important;padding:3px 4px!important}</style>${legend ? `<p>${esc(legend)}</p>` : ""}${table}${sign}` });
}

export function registerCsv(t: RegisterTable) {
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [t.head, ...t.body].map(r => r.map(q).join(",")).join("\n");
}

export async function registerPdf(title: string, subtitle: string, t: RegisterTable, legend?: string): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  try { doc.addImage(await urlToDataUrl(SCHOOL_LOGO_URL), "PNG", 10, 8, 22, 22); } catch { /* logo optional */ }
  doc.setFontSize(15).setTextColor(15, 76, 92).text(SCHOOL_NAME, 36, 15);
  doc.setFontSize(9).setTextColor(90).text(`${SCHOOL_MOTTO} · ${SCHOOL_PHONE_EMAIL_LINE}`, 36, 21);
  doc.setFontSize(12).setTextColor(30, 58, 95).text(title, 36, 28);
  doc.setFontSize(9).setTextColor(90).text(`${subtitle} · Generated ${new Date().toLocaleString("en-GB")}`, 36, 33);
  if (legend) doc.text(legend, 10, 39);
  autoTable(doc, {
    head: [t.head], body: t.body.map(r => r.map(String)), startY: legend ? 42 : 38, theme: "grid",
    styles: { fontSize: t.head.length > 25 ? 6 : 8, cellPadding: 1.2 },
    headStyles: { fillColor: [15, 76, 92], textColor: 255 },
    margin: { left: 10, right: 10 },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let y = ((doc as any).lastAutoTable?.finalY ?? 60) + 14;
  if (y > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); y = 25; }
  doc.setFontSize(9).setTextColor(40);
  doc.text("Class teacher: ______________________   Signature: ______________   Date: ____________", 10, y);
  doc.text("Head / Deputy: ______________________   Signature: ______________   School stamp:", 10, y + 9);
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(8).setTextColor(130).text(`${SCHOOL_NAME} · Official record · Page ${i} of ${pages}`, w / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" }); }
  return doc;
}
