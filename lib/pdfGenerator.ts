// lib/pdfGenerator.ts
// Builds a professional PDF report from a CompanyReport using pdfkit.
// Runs server-side only (Node runtime), returns a Buffer.

import PDFDocument from 'pdfkit';
import type { CompanyReport } from './types';

const INK = '#0F1419';
const ACCENT = '#B9772F';
const MUTED = '#5B6470';

export async function buildCompanyPdf(report: CompanyReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header / stamp
      doc.rect(0, 0, doc.page.width, 90).fill(INK);
      doc
        .fillColor('#E8E6E1')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('COMPANY RESEARCH DOSSIER', 50, 28);
      doc
        .fillColor(ACCENT)
        .fontSize(10)
        .font('Helvetica')
        .text(`Generated ${new Date(report.generatedAt).toLocaleString()} · Model: ${report.model}`, 50, 58);

      doc.moveDown(4);
      doc.fillColor(INK);

      // Company header
      doc.fontSize(20).font('Helvetica-Bold').text(report.companyName, { continued: false });
      doc.fontSize(11).font('Helvetica').fillColor(MUTED).text(report.website);
      doc.moveDown(0.5);

      const infoLine: string[] = [];
      if (report.phone) infoLine.push(`Phone: ${report.phone}`);
      if (report.address) infoLine.push(`Address: ${report.address}`);
      if (infoLine.length) {
        doc.fontSize(10).fillColor(MUTED).text(infoLine.join('   |   '));
      }
      doc.moveDown(1);

      sectionTitle(doc, 'Company Summary');
      doc.fontSize(11).fillColor(INK).font('Helvetica').text(report.summary, { align: 'left' });
      doc.moveDown(1);

      sectionTitle(doc, 'Products / Services');
      bulletList(doc, report.products.length ? report.products : ['Not publicly available']);
      doc.moveDown(1);

      sectionTitle(doc, 'AI-Generated Pain Points');
      bulletList(doc, report.painPoints.length ? report.painPoints : ['Not enough public data to infer pain points']);
      doc.moveDown(1);

      sectionTitle(doc, 'Competitor Analysis');
      if (report.competitors.length) {
        report.competitors.forEach((c) => {
          doc.fontSize(11).font('Helvetica-Bold').fillColor(INK).text(c.name);
          doc.fontSize(10).font('Helvetica').fillColor(ACCENT).text(c.website);
          if (c.reason) doc.fontSize(9).fillColor(MUTED).text(c.reason);
          doc.moveDown(0.4);
        });
      } else {
        doc.fontSize(11).fillColor(MUTED).text('No competitors identified from available sources.');
      }

      doc.moveDown(1);
      sectionTitle(doc, 'Sources');
      doc.fontSize(8).fillColor(MUTED).font('Helvetica');
      (report.sources.length ? report.sources : ['n/a']).forEach((s) => doc.text(s));

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.3);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(ACCENT).text(title.toUpperCase());
  doc
    .moveTo(doc.x, doc.y + 2)
    .lineTo(doc.page.width - 50, doc.y + 2)
    .strokeColor('#D9D4C8')
    .stroke();
  doc.moveDown(0.5);
}

function bulletList(doc: PDFKit.PDFDocument, items: string[]) {
  doc.fontSize(11).font('Helvetica').fillColor(INK);
  items.forEach((item) => {
    doc.text(`•  ${item}`, { indent: 4 });
  });
}
