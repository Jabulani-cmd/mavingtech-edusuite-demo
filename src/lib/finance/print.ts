import type { ReceiptPrintInput } from "./pdf";
import { buildReceiptHtml } from "./pdf";

export function openPrintWindow(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  // Give the browser a beat to load images
  setTimeout(() => {
    w.print();
  }, 250);
}

export function printReceipt(input: ReceiptPrintInput) {
  openPrintWindow(buildReceiptHtml(input));
}
