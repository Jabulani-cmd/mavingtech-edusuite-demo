import type { ReceiptPrintInput } from "./pdf";
import { buildReceiptHtml } from "./pdf";

export function openPrintWindow(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  // Wait for images (logo) to fully load before printing
  const triggerPrint = () => {
    try { w.print(); } catch { /* noop */ }
  };
  if (w.document.readyState === "complete") {
    setTimeout(triggerPrint, 300);
  } else {
    w.addEventListener("load", () => setTimeout(triggerPrint, 200));
  }
}

export function printReceipt(input: ReceiptPrintInput) {
  openPrintWindow(buildReceiptHtml(input));
}
