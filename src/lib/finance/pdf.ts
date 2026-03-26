import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// School branding constants
export const SCHOOL_NAME = "Gifford High School";
export const SCHOOL_MOTTO = "Hinc Orior – From Here I Arise";
export const SCHOOL_ADDRESS = "P.O. Box 1965, Bulawayo, Zimbabwe";
export const SCHOOL_PHONE = "+263 29 288 3621";
export const SCHOOL_EMAIL = "info@giffordhigh.ac.zw";
export const SCHOOL_LOGO_URL = "/images/school-logo-print.png";

export type Money = { usd: number; zig: number };

export type InvoicePdfInput = {
  schoolName?: string;
  motto?: string;
  logoDataUrl?: string;
  invoiceNumber: string;
  academicYear: string;
  term: string;
  dueDate?: string | null;
  student: { fullName: string; admissionNumber: string; form?: string | null };
  items: { description: string; amount_usd: number; amount_zig: number }[];
  totals: { total_usd: number; total_zig: number; paid_usd: number; paid_zig: number };
};

export async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load image: ${res.status}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}

export function buildInvoicePdf(input: InvoicePdfInput): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const name = input.schoolName || SCHOOL_NAME;
  const motto = input.motto || SCHOOL_MOTTO;

  // ─── Header with logo ───
  const topY = 14;
  if (input.logoDataUrl) {
    try {
      const props = doc.getImageProperties(input.logoDataUrl);
      const aspectRatio = props.width && props.height ? props.width / props.height : 0.75;
      const logoHeight = 65;
      const logoWidth = logoHeight * aspectRatio;
      doc.addImage(input.logoDataUrl, "PNG", 14, 8, logoWidth, logoHeight);
    } catch {
      // Ignore logo rendering errors
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(name, pageWidth / 2, topY, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(`"${motto}"`, pageWidth / 2, topY + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(SCHOOL_ADDRESS, pageWidth / 2, topY + 11, { align: "center" });
  doc.text(`Tel: ${SCHOOL_PHONE}  |  Email: ${SCHOOL_EMAIL}`, pageWidth / 2, topY + 15, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("INVOICE", pageWidth / 2, topY + 24, { align: "center" });

  // Decorative line
  doc.setDrawColor(128, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(14, topY + 27, pageWidth - 14, topY + 27);
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);

  // Invoice details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const detailY = topY + 33;
  doc.text(`Invoice #: ${input.invoiceNumber}`, 14, detailY);
  doc.text(`Term: ${input.term}  |  Year: ${input.academicYear}`, 14, detailY + 5);
  doc.text(`Due Date: ${input.dueDate ? new Date(input.dueDate).toLocaleDateString() : "—"}`, 14, detailY + 10);

  // Student info
  doc.text(`Student: ${input.student.fullName}`, pageWidth / 2, detailY, { align: "left" });
  doc.text(`Admission #: ${input.student.admissionNumber}`, pageWidth / 2, detailY + 5);
  if (input.student.form) {
    doc.text(`Form: ${input.student.form}`, pageWidth / 2, detailY + 10);
  }

  doc.line(14, detailY + 15, pageWidth - 14, detailY + 15);

  // Items table
  autoTable(doc, {
    startY: detailY + 19,
    head: [["Description", "USD", "ZiG"]],
    body: input.items.map((it) => [
      it.description,
      Number(it.amount_usd || 0).toFixed(2),
      Number(it.amount_zig || 0).toFixed(2),
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [128, 0, 0] },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: "right", cellWidth: 25 },
      2: { halign: "right", cellWidth: 25 },
    },
  });

  const endY = (doc as any).lastAutoTable?.finalY || detailY + 70;

  const totalUsd = Number(input.totals.total_usd || 0);
  const totalZig = Number(input.totals.total_zig || 0);
  const paidUsd = Number(input.totals.paid_usd || 0);
  const paidZig = Number(input.totals.paid_zig || 0);
  const rawBalUsd = totalUsd - paidUsd;
  const rawBalZig = totalZig - paidZig;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`TOTAL:     USD ${totalUsd.toFixed(2)}     ZiG ${totalZig.toFixed(2)}`, 14, endY + 10);
  doc.text(`PAID:      USD ${paidUsd.toFixed(2)}     ZiG ${paidZig.toFixed(2)}`, 14, endY + 16);

  doc.setDrawColor(128, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, endY + 19, pageWidth - 14, endY + 19);
  doc.setDrawColor(0);

  doc.setFontSize(11);
  if (rawBalUsd < 0 || rawBalZig < 0) {
    doc.text(`CREDIT:    USD +${Math.abs(rawBalUsd).toFixed(2)}     ZiG +${Math.abs(rawBalZig).toFixed(2)}`, 14, endY + 26);
  } else {
    doc.text(`BALANCE:   USD ${rawBalUsd.toFixed(2)}     ZiG ${rawBalZig.toFixed(2)}`, 14, endY + 26);
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, endY + 34);
  doc.text("This is a computer-generated document.", 14, endY + 38);

  return doc;
}

// ═══ INVOICE HTML (for view/print) ═══

export function buildInvoiceHtml(input: InvoicePdfInput): string {
  const safe = (s: any) => String(s ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const name = input.schoolName || SCHOOL_NAME;
  const motto = input.motto || SCHOOL_MOTTO;
  const logoUrl = input.logoDataUrl || SCHOOL_LOGO_URL;

  const totalUsd = Number(input.totals.total_usd || 0);
  const totalZig = Number(input.totals.total_zig || 0);
  const paidUsd = Number(input.totals.paid_usd || 0);
  const paidZig = Number(input.totals.paid_zig || 0);
  const rawBalUsd = totalUsd - paidUsd;
  const rawBalZig = totalZig - paidZig;

  const itemRows = input.items.map(it => `
    <tr>
      <td>${safe(it.description)}</td>
      <td class="right mono">${Number(it.amount_usd || 0).toFixed(2)}</td>
      <td class="right mono">${Number(it.amount_zig || 0).toFixed(2)}</td>
    </tr>`).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${safe(input.invoiceNumber)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; max-width: 700px; margin: 0 auto; }
    .header { display:flex; justify-content:space-between; align-items:center; }
    .brand { display:flex; gap:14px; align-items:center; }
    .brand img { height:160px; width:auto; max-width:140px; object-fit:contain; aspect-ratio:3 / 4; display:block; }
    .brand-text h1 { font-size: 18px; margin: 0; }
    .brand-text .motto { color: #555; font-style: italic; font-size: 10px; margin: 2px 0; }
    .brand-text .address { color: #666; font-size: 9px; }
    .invoice-title { text-align: right; }
    .invoice-title strong { font-size: 14px; display: block; }
    .invoice-title .num { font-family: monospace; font-size: 12px; }
    .row { display:flex; justify-content:space-between; gap: 12px; }
    .muted { color: #444; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .right { text-align: right; }
    .divider { border-top: 2px solid #800000; margin: 14px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; font-size: 11px; }
    th { background: #800000; color: #fff; }
    .totals { margin-top: 14px; font-size: 12px; }
    .totals .balance { font-size: 14px; font-weight: bold; margin-top: 8px; border-top: 2px solid #800000; padding-top: 8px; }
    .footer { margin-top: 24px; font-size: 9px; color: #888; text-align: center; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${safe(logoUrl)}" alt="School Logo" />
      <div class="brand-text">
        <h1>${safe(name)}</h1>
        <div class="motto">"${safe(motto)}"</div>
        <div class="address">${safe(SCHOOL_ADDRESS)} | Tel: ${safe(SCHOOL_PHONE)}</div>
      </div>
    </div>
    <div class="invoice-title">
      <strong>INVOICE</strong>
      <div class="num">${safe(input.invoiceNumber)}</div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="row">
    <div>
      <div><strong>Student:</strong> ${safe(input.student.fullName)}</div>
      <div><strong>Admission #:</strong> <span class="mono">${safe(input.student.admissionNumber)}</span></div>
      ${input.student.form ? `<div><strong>Form:</strong> ${safe(input.student.form)}</div>` : ""}
    </div>
    <div class="right">
      <div><strong>Term:</strong> ${safe(input.term)} | <strong>Year:</strong> ${safe(input.academicYear)}</div>
      <div><strong>Due Date:</strong> ${input.dueDate ? new Date(input.dueDate).toLocaleDateString() : "—"}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Description</th><th class="right">USD</th><th class="right">ZiG</th></tr></thead>
    <tbody>${itemRows || "<tr><td colspan='3'>No items</td></tr>"}</tbody>
  </table>

  <div class="totals">
    <div><strong>Total:</strong> USD ${totalUsd.toFixed(2)} &nbsp;|&nbsp; ZiG ${totalZig.toFixed(2)}</div>
    <div><strong>Paid:</strong> USD ${paidUsd.toFixed(2)} &nbsp;|&nbsp; ZiG ${paidZig.toFixed(2)}</div>
    <div class="balance">${rawBalUsd < 0 ? `Credit Balance: USD +${Math.abs(rawBalUsd).toFixed(2)} &nbsp;|&nbsp; ZiG +${Math.abs(rawBalZig).toFixed(2)}` : `Balance Due: USD ${rawBalUsd.toFixed(2)} &nbsp;|&nbsp; ZiG ${rawBalZig.toFixed(2)}`}</div>
  </div>

  <div class="footer">
    <p>Generated: ${new Date().toLocaleString()} | This is a computer-generated document.</p>
    <p>${safe(name)} | ${safe(SCHOOL_ADDRESS)}</p>
  </div>
</body>
</html>`;
}

// ═══ RECEIPT HTML ═══

export type ReceiptPrintInput = {
  schoolName?: string;
  motto?: string;
  logoUrl?: string;
  receiptNumber: string;
  paymentDate: string;
  student: { fullName: string; admissionNumber: string; form?: string | null };
  invoiceNumber?: string | null;
  amounts: { usd: number; zig: number };
  paymentMethod: string;
  referenceNumber?: string | null;
};

export function buildReceiptHtml(input: ReceiptPrintInput) {
  const safe = (s: any) => String(s ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const name = input.schoolName || SCHOOL_NAME;
  const motto = input.motto || SCHOOL_MOTTO;
  const logoUrl = input.logoUrl || SCHOOL_LOGO_URL;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${safe(input.receiptNumber)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; max-width: 700px; margin: 0 auto; }
    .header { display:flex; justify-content:space-between; align-items:center; }
    .brand { display:flex; gap:14px; align-items:center; }
    .brand img { height:160px; width:auto; max-width:140px; object-fit:contain; aspect-ratio:3 / 4; display:block; }
    .brand-text h1 { font-size: 18px; margin: 0; }
    .brand-text .motto { color: #555; font-style: italic; font-size: 10px; margin: 2px 0; }
    .brand-text .address { color: #666; font-size: 9px; }
    .receipt-title { text-align: right; }
    .receipt-title strong { font-size: 14px; display: block; }
    .receipt-title .num { font-family: monospace; font-size: 12px; }
    .row { display:flex; justify-content:space-between; gap: 12px; }
    .muted { color: #444; }
    .box { border: 2px solid #800000; padding: 14px; margin-top: 14px; border-radius: 4px; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .right { text-align: right; }
    hr { border: 0; border-top: 1px solid #ccc; margin: 12px 0; }
    .divider { border-top: 2px solid #800000; margin: 14px 0; }
    .footer { margin-top: 20px; font-size: 9px; color: #888; text-align: center; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${safe(logoUrl)}" alt="School Logo" />
      <div class="brand-text">
        <h1>${safe(name)}</h1>
        <div class="motto">"${safe(motto)}"</div>
        <div class="address">${safe(SCHOOL_ADDRESS)} | Tel: ${safe(SCHOOL_PHONE)}</div>
      </div>
    </div>
    <div class="receipt-title">
      <strong>OFFICIAL RECEIPT</strong>
      <div class="num">${safe(input.receiptNumber)}</div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="row">
    <div>
      <div><strong>Student:</strong> ${safe(input.student.fullName)}</div>
      <div><strong>Admission #:</strong> <span class="mono">${safe(input.student.admissionNumber)}</span></div>
      ${input.student.form ? `<div><strong>Form:</strong> ${safe(input.student.form)}</div>` : ""}
    </div>
    <div class="right">
      <div><strong>Date:</strong> ${safe(input.paymentDate)}</div>
      ${input.invoiceNumber ? `<div><strong>Invoice:</strong> <span class="mono">${safe(input.invoiceNumber)}</span></div>` : ""}
    </div>
  </div>

  <div class="box">
    <div class="row">
      <div><strong>Payment Method:</strong> ${safe(input.paymentMethod)}</div>
      <div><strong>Reference:</strong> <span class="mono">${safe(input.referenceNumber || "—")}</span></div>
    </div>
    <hr />
    <div class="row">
      <div><strong>Amount Paid (USD):</strong></div>
      <div class="mono" style="font-size:14px;"><strong>$${Number(input.amounts.usd || 0).toFixed(2)}</strong></div>
    </div>
    <div class="row" style="margin-top:6px;">
      <div><strong>Amount Paid (ZiG):</strong></div>
      <div class="mono" style="font-size:14px;"><strong>${Number(input.amounts.zig || 0).toFixed(2)}</strong></div>
    </div>
  </div>

  <p class="muted" style="margin-top: 16px;">Thank you for your payment. Please keep this receipt for your records.</p>

  <div class="footer">
    <p>This is a computer-generated receipt. | ${safe(name)} | ${safe(SCHOOL_ADDRESS)}</p>
  </div>
</body>
</html>`;
}

// ═══ STATEMENT HTML ═══

export type StatementPrintInput = {
  logoUrl?: string;
  student: { fullName: string; admissionNumber: string; form?: string | null };
  invoices: { invoice_number: string; term: string; academic_year: string; total_usd: number; total_zig: number; paid_usd: number; paid_zig: number; status: string }[];
  payments: { receipt_number: string; payment_date: string; amount_usd: number; amount_zig: number; payment_method: string }[];
};

export function buildStatementHtml(input: StatementPrintInput) {
  const safe = (s: any) => String(s ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const logoUrl = input.logoUrl || SCHOOL_LOGO_URL;

  const invoiceRows = input.invoices.map(inv => `
    <tr>
      <td class="mono">${safe(inv.invoice_number)}</td>
      <td>${safe(inv.term)} ${safe(inv.academic_year)}</td>
      <td class="right">$${Number(inv.total_usd || 0).toFixed(2)}</td>
      <td class="right">${Number(inv.total_zig || 0).toFixed(2)}</td>
      <td class="right">$${Number(inv.paid_usd || 0).toFixed(2)}</td>
      <td class="right">${Number(inv.paid_zig || 0).toFixed(2)}</td>
      <td>${safe(inv.status)}</td>
    </tr>`).join("");

  const paymentRows = input.payments.map(p => `
    <tr>
      <td class="mono">${safe(p.receipt_number)}</td>
      <td>${safe(p.payment_date)}</td>
      <td class="right">$${Number(p.amount_usd || 0).toFixed(2)}</td>
      <td class="right">${Number(p.amount_zig || 0).toFixed(2)}</td>
      <td>${safe(p.payment_method)}</td>
    </tr>`).join("");

  const totalOwedUsd = input.invoices.reduce((s, i) => s + (Number(i.total_usd) - Number(i.paid_usd)), 0);
  const totalOwedZig = input.invoices.reduce((s, i) => s + (Number(i.total_zig) - Number(i.paid_zig)), 0);
  const balanceLabel = totalOwedUsd < 0 ? 'Credit Balance' : 'Outstanding Balance';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Statement - ${safe(input.student.fullName)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; font-size: 11px; max-width: 800px; margin: 0 auto; }
    .header { display:flex; gap:14px; align-items:center; margin-bottom: 6px; }
    .header img { height:160px; width:auto; max-width:140px; object-fit:contain; aspect-ratio:3 / 4; display:block; }
    .header h1 { font-size: 18px; margin: 0; }
    .header .motto { color: #555; font-style: italic; font-size: 10px; }
    .header .address { color: #666; font-size: 9px; }
    .divider { border-top: 2px solid #800000; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 10px; }
    th { background: #800000; color: #fff; }
    .right { text-align: right; }
    .mono { font-family: monospace; }
    .balance { font-size: 13px; font-weight: bold; margin-top: 14px; }
    .footer { margin-top: 20px; font-size: 9px; color: #888; text-align: center; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${safe(logoUrl)}" alt="Logo" />
    <div>
      <h1>${safe(SCHOOL_NAME)}</h1>
      <div class="motto">"${safe(SCHOOL_MOTTO)}"</div>
      <div class="address">${safe(SCHOOL_ADDRESS)} | Tel: ${safe(SCHOOL_PHONE)}</div>
    </div>
  </div>
  <div class="divider"></div>

  <h2 style="font-size:14px; margin: 8px 0;">STUDENT ACCOUNT STATEMENT</h2>
  <p><strong>Student:</strong> ${safe(input.student.fullName)} &nbsp; | &nbsp; <strong>Admission #:</strong> <span class="mono">${safe(input.student.admissionNumber)}</span>${input.student.form ? ` &nbsp; | &nbsp; <strong>Form:</strong> ${safe(input.student.form)}` : ""}</p>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

  <h3 style="margin-top:14px;">Invoices</h3>
  <table>
    <thead><tr><th>Invoice #</th><th>Period</th><th>Total USD</th><th>Total ZiG</th><th>Paid USD</th><th>Paid ZiG</th><th>Status</th></tr></thead>
    <tbody>${invoiceRows || "<tr><td colspan='7'>No invoices</td></tr>"}</tbody>
  </table>

  <h3 style="margin-top:14px;">Payments</h3>
  <table>
    <thead><tr><th>Receipt #</th><th>Date</th><th>USD</th><th>ZiG</th><th>Method</th></tr></thead>
    <tbody>${paymentRows || "<tr><td colspan='5'>No payments</td></tr>"}</tbody>
  </table>

  <div class="balance">${balanceLabel}: USD ${totalOwedUsd < 0 ? Math.abs(totalOwedUsd).toFixed(2) : totalOwedUsd.toFixed(2)} &nbsp; | &nbsp; ZiG ${totalOwedZig < 0 ? Math.abs(totalOwedZig).toFixed(2) : totalOwedZig.toFixed(2)}</div>

  <div class="footer">
    <p>This is a computer-generated statement. | ${safe(SCHOOL_NAME)} | ${safe(SCHOOL_ADDRESS)}</p>
  </div>
</body>
</html>`;
}
