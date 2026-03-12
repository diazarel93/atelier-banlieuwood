import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export async function exportElementAsImage(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#0F172A",
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportElementAsPdf(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#0F172A",
  });

  // Get element dimensions for proper PDF sizing
  const w = element.offsetWidth;
  const h = element.offsetHeight;

  // A4-width PDF scaled to match element aspect ratio
  const pdfWidth = 210; // mm (A4)
  const pdfHeight = (h / w) * pdfWidth;

  const pdf = new jsPDF({
    orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
