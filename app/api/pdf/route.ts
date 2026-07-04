import { NextRequest, NextResponse } from 'next/server';
import { buildCompanyPdf } from '@/lib/pdfGenerator';
import type { CompanyReport } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const report: CompanyReport = await req.json();
    const pdfBuffer = await buildCompanyPdf(report);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(report.companyName || 'company').replace(/\s+/g, '-')}-dossier.pdf"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
