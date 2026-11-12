import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class ReceiptService {
  async generateReceipt(payment: Payment): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('STUDENT LOANS BOARD', { align: 'center' });

        doc
          .fontSize(12)
          .font('Helvetica')
          .text('Malawi', { align: 'center' })
          .moveDown(0.5);

        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(1);

        // Title
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('OFFICIAL PAYMENT RECEIPT', { align: 'center' })
          .moveDown(1.5);

        // Receipt metadata
        const receiptNumber = this.buildReceiptNumber(payment);
        const issuedDate = new Date().toLocaleString('en-GB', {
          timeZone: 'Africa/Blantyre',
        });

        doc.fontSize(10).font('Helvetica');
        doc.text(`Receipt No: ${receiptNumber}`);
        doc.text(`Date Issued: ${issuedDate}`);
        doc.moveDown(1);

        this.separator(doc);

        // Paid by
        doc.fontSize(11).font('Helvetica-Bold').text('PAID BY');
        doc.fontSize(10).font('Helvetica');
        doc.text(`User ID: ${payment.userId ?? 'N/A'}`);
        doc.moveDown(1);

        this.separator(doc);

        // Payment details
        doc.fontSize(11).font('Helvetica-Bold').text('PAYMENT DETAILS');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Loan Application: ${payment.applicationId ?? 'N/A'}`);
        doc.text(`Amount Paid: K ${Number(payment.amount).toFixed(2)}`);
        doc.text(`Payment Method: ${payment.paymentMethod ?? 'N/A'}`);
        doc.text(`Transaction Reference: ${payment.transactionReference}`);
        doc.text(`Status: ${payment.status}`);
        doc.moveDown(1);

        this.separator(doc);

        // Footer
        doc
          .fontSize(9)
          .font('Helvetica-Oblique')
          .text(
            'This is a computer-generated receipt and does not require a signature.',
            { align: 'center' },
          )
          .moveDown(0.5);

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('gray')
          .text(
            `Verify at: /api/payments/verify/${payment.transactionReference}`,
            { align: 'center' },
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private separator(doc: PDFKit.PDFDocument): void {
    doc
      .moveDown(0.5)
      .strokeColor('#cccccc')
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .strokeColor('black')
      .moveDown(0.5);
  }

  private buildReceiptNumber(payment: Payment): string {
    const created = new Date(payment.createdAt);
    const datePart = `${created.getFullYear()}${String(created.getMonth() + 1).padStart(2, '0')}${String(created.getDate()).padStart(2, '0')}`;
    const refPart =
      payment.transactionReference?.slice(-8) ?? payment.id.slice(-8);
    return `RCP-${datePart}-${refPart.toUpperCase()}`;
  }
}
