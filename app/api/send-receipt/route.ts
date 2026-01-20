import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

interface ReceiptData {
  receiptId: number;
  studentName: string;
  section: string;
  issuedAt: string;
}

async function generateReceiptPdfBuffer(receipt: ReceiptData): Promise<Buffer> {
  // Read the template PDF from the public folder
  const templatePath = path.join(process.cwd(), 'public', 'Yearbook Receipts.pdf');
  const templateBytes = fs.readFileSync(templatePath);

  // Load the PDF document
  const pdfDoc = await PDFDocument.load(templateBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Embed font
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = firstPage.getSize();

  // Format Data
  const idSuffix = String(receipt.receiptId).padStart(3, '0');
  const issuedDate = receipt.issuedAt
    ? new Date(receipt.issuedAt).toLocaleDateString('en-GB')
    : 'N/A';
  const studentName = (receipt.studentName || '').toUpperCase();
  const section = (receipt.section || '').toUpperCase();

  const textColor = rgb(0, 0, 0);
  const fontSize = 12;

  // Fill Receipt ID
  firstPage.drawText(idSuffix, {
    x: 110,
    y: height - 92,
    size: fontSize,
    font: font,
    color: textColor,
  });

  // Fill Issued Date
  firstPage.drawText(issuedDate, {
    x: 485,
    y: height - 92,
    size: fontSize,
    font: font,
    color: textColor,
  });

  // Fill Student Name
  firstPage.drawText(studentName, {
    x: 295,
    y: height - 127,
    size: fontSize,
    font: font,
    color: textColor,
  });

  // Fill Class & Section
  firstPage.drawText(section, {
    x: 525,
    y: height - 127,
    size: fontSize,
    font: font,
    color: textColor,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receipt, recipientEmail } = body;

    if (!receipt || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing receipt data or recipient email' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateReceiptPdfBuffer(receipt);

    // Configure nodemailer transporter
    // Using Gmail SMTP - you'll need to set up environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "bindraagamjot256@gmail.com",
        pass: "gmfk jald gnvn tnim",
      },
    });
    console.log('Email transporter configured');

    const receiptId = `YB25-${String(receipt.receiptId).padStart(3, '0')}`;

    // Send email
    await transporter.sendMail({
      from: "Agamjot Singh Bindra on behalf of the student council of 2025-26",
      to: recipientEmail,
      cc: 'ajs.bindra@proton.me',
      subject: `Your Yearbook Receipt ${receiptId} Has Been Issued`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">Yearbook Receipt Issued</h2>
          <p>Dear <strong>${receipt.studentName}</strong>,</p>
          <p>Your yearbook receipt has been successfully issued!</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Receipt ID:</strong> ${receiptId}</p>
            <p><strong>Section:</strong> ${receipt.section}</p>
            <p><strong>Issue Date:</strong> ${new Date(receipt.issuedAt).toLocaleDateString('en-GB')}</p>
          </div>
          <p>Please find your receipt attached to this email as a PDF.</p>
          <p>Keep this receipt safe - you will need to present it when collecting your yearbook.</p>
          <br/>
          <p style="color: #64748b; font-size: 12px;">This is an automated message from the Yearbook Receipt Tracker.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Receipt-${receiptId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    console.log('Email sent successfully');

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    );
  }
}
