import type { ReceiptPrintInput } from "./pdf";
import { buildReceiptHtml } from "./pdf";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

// Render a fully-formed HTML document string into an offscreen iframe,
// snapshot its body with html2canvas, and paginate onto an A4 jsPDF —
// producing a real .pdf file that mirrors the on-screen branded template.
async function renderHtmlToPdf(html: string): Promise<jsPDF> {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // A4 @ 96dpi
  iframe.style.height = "1123px";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    // Wait for load + images + fonts
    await new Promise<void>((resolve) => {
      if (doc.readyState === "complete") resolve();
      else iframe.addEventListener("load", () => resolve(), { once: true });
    });
    const imgs = Array.from(doc.images || []);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
      ),
    );
    // @ts-ignore
    if (doc.fonts?.ready) { try { await doc.fonts.ready; } catch {} }
    await new Promise((r) => setTimeout(r, 100));

    const target = (doc.body || doc.documentElement) as HTMLElement;
    // Ensure white background for the capture
    target.style.background = target.style.background || "#ffffff";

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    });

    const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (imgH <= pageH) {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(dataUrl, "JPEG", 0, 0, imgW, imgH);
    } else {
      // Slice the source canvas per page.
      const pxPerPage = (canvas.width * pageH) / pageW;
      let renderedPx = 0;
      let first = true;
      while (renderedPx < canvas.height) {
        const sliceH = Math.min(pxPerPage, canvas.height - renderedPx);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const dataUrl = slice.toDataURL("image/jpeg", 0.95);
        const hOnPage = (sliceH * imgW) / canvas.width;
        if (!first) pdf.addPage();
        pdf.addImage(dataUrl, "JPEG", 0, 0, imgW, hOnPage);
        first = false;
        renderedPx += sliceH;
      }
    }

    return pdf;
  } finally {
    document.body.removeChild(iframe);
  }
}

/**
 * Trigger a real PDF file download of a branded HTML document.
 * The HTML template is rendered offscreen (preserving logo, colors and
 * layout) and captured into a paginated A4 PDF.
 */
export async function downloadHtmlDocument(html: string, filename: string) {
  const base = filename.replace(/\.(pdf|html?)$/i, "");
  try {
    const pdf = await renderHtmlToPdf(html);
    pdf.save(`${base}.pdf`);
  } catch (err) {
    console.error("PDF export failed, falling back to HTML download", err);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function printReceipt(input: ReceiptPrintInput) {
  openPrintWindow(buildReceiptHtml(input));
}
