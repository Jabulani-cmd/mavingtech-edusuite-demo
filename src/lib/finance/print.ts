import type { ReceiptPrintInput } from "./pdf";
import { buildReceiptHtml } from "./pdf";

export function openPrintWindow(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  const triggerPrint = () => {
    try { w.print(); } catch { /* noop */ }
  };
  if (w.document.readyState === "complete") {
    setTimeout(triggerPrint, 300);
  } else {
    w.addEventListener("load", () => setTimeout(triggerPrint, 200));
  }
}

// Open the document in a new tab WITHOUT triggering the print dialog.
export function openViewWindow(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
}

// Trigger a real file download of the printable document. Browsers will
// download the .html file which the user can open and save as PDF, and
// it carries the school logo + branding inline.
export function downloadHtmlDocument(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printReceipt(input: ReceiptPrintInput) {
  openPrintWindow(buildReceiptHtml(input));
}
