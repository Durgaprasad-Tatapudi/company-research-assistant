import { NextRequest, NextResponse } from 'next/server';
import { buildCompanyPdf } from '@/lib/pdfGenerator';
import { sendDiscordReport } from '@/lib/discord';
import type { CompanyReport } from '@/lib/types';

export const runtime = 'nodejs';

interface DiscordRequestBody {
  report: CompanyReport;
  botToken: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: DiscordRequestBody = await req.json();
    const { report, botToken, channelId, applicantName, applicantEmail } = body;

    if (!botToken || !channelId) {
      return NextResponse.json({ error: 'Discord Bot Token and Channel ID are required.' }, { status: 400 });
    }

    const pdfBuffer = await buildCompanyPdf(report);
    const fileName = `${(report.companyName || 'company').replace(/\s+/g, '-')}-dossier.pdf`;

    const result = await sendDiscordReport({
      botToken,
      channelId,
      applicantName: applicantName || 'Unknown applicant',
      applicantEmail: applicantEmail || 'unknown@example.com',
      companyName: report.companyName,
      companyWebsite: report.website,
      pdfBuffer,
      pdfFileName: fileName
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to notify Discord' }, { status: 500 });
  }
}
