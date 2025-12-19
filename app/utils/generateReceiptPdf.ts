import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Receipt } from '../types';

export async function generateReceiptPdf(receipt: Receipt): Promise<void> {
  // Fetch the template PDF
  const templateUrl = '/Yearbook Receipts.pdf';
  const templateBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());

  // Load the PDF document
  const pdfDoc = await PDFDocument.load(templateBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Embed font (using Helvetica Bold for the filled-in data so it stands out)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = firstPage.getSize();

  // 1. Format Data
  // Since the PDF already says "YB25-", we only provide the numeric suffix
  const idSuffix = String(receipt.receiptId).padStart(3, '0');

  const issuedDate = receipt.issuedAt
      ? new Date(receipt.issuedAt).toLocaleDateString('en-GB') // DD/MM/YYYY format
      : 'N/A';

  const studentName = (receipt.studentName || '').toUpperCase();
  const section = (receipt.section || '').toUpperCase();

  // 2. Define Styles
  const textColor = rgb(0, 0, 0);
  const fontSize = 12;

  // 3. Draw Text at Specific Coordinates
  // Note: PDF coordinates start from Bottom-Left (0,0)

  // Fill Receipt ID (placed after "Receipt ID: YB25-")
  firstPage.drawText(idSuffix, {
    x: 110,
    y: height - 92,
    size: fontSize,
    font: font,
    color: textColor,
  });

  // Fill Issued Date (placed after "Issued on:")
  firstPage.drawText(issuedDate, {
    x: 485,
    y: height - 92,
    size: fontSize,
    font: font,
    color: textColor,
  });

  // Fill Student Name (placed on the long underline)
  // We calculate width to center it slightly on the line if desired,
  // but left-aligned starting at the line is safer.
  firstPage.drawText(studentName, {
    x: 295,
    y: height - 127,
    size: fontSize,
    font: font,
    color: textColor,
  });

  // Fill Class & Section (placed on the short underline at the end)
  firstPage.drawText(section, {
    x: 525,
    y: height - 127,
    size: fontSize,
    font: font,
    color: textColor,
  });

  // Serialize and Open
  const pdfBytes = await pdfDoc.save();
  // @ts-ignore
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  // Clean up and open
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.onload = () => URL.revokeObjectURL(url);
  }
}