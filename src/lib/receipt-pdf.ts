import { jsPDF } from "jspdf";

type ReceiptData = {
  paymentId: string;
  residentName: string;
  apartmentNo: string;
  period: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  siteName?: string;
};

export function generateReceiptPdf(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const siteName = data.siteName || "Site Yönetimi";

  // Header gradient (indigo bar)
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, w, 40, "F");

  // Site name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(siteName, w / 2, 18, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Odeme Dekontu", w / 2, 28, { align: "center" });

  // Transaction ID
  doc.setFontSize(8);
  doc.text(`Islem No: ${data.paymentId}`, w / 2, 35, { align: "center" });

  // Receipt body
  const startY = 52;
  const leftMargin = 20;
  const rightMargin = w - 20;
  const lineHeight = 10;

  // Title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ODeme Bilgileri", leftMargin, startY);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, startY + 4, rightMargin, startY + 4);

  // Fields
  const fields: [string, string][] = [
    ["Uye Adi Soyadi", data.residentName],
    ["Daire", data.apartmentNo || "-"],
    ["Odeme Donemi", data.period],
    ["Odeme Turu", data.type],
    ["Odeme Tarihi", data.date],
    ["Durum", data.status],
  ];

  let y = startY + 14;
  doc.setFontSize(11);

  for (const [label, value] of fields) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(label, leftMargin, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(value, rightMargin, y, { align: "right" });

    y += lineHeight;
  }

  // Total box
  y += 4;
  doc.setFillColor(240, 240, 255);
  doc.roundedRect(leftMargin, y - 4, rightMargin - leftMargin, 18, 3, 3, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Toplam Tutar", leftMargin + 6, y + 7);

  doc.setFontSize(16);
  doc.text(`${data.amount.toLocaleString("tr-TR")} TL`, rightMargin - 6, y + 7, { align: "right" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Bu dekont ${siteName} tarafindan olusturulmustur. Irsaliye niteliginde degildir.`,
    w / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    `Olusturulma Tarihi: ${new Date().toLocaleDateString("tr-TR")}`,
    w / 2,
    footerY + 5,
    { align: "center" }
  );

  return doc;
}

export function downloadReceiptPdf(data: ReceiptData) {
  const doc = generateReceiptPdf(data);
  doc.save(`dekont-${data.paymentId}.pdf`);
}

export function printReceiptPdf(data: ReceiptData) {
  const doc = generateReceiptPdf(data);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
