// lib/discord.ts
// Sends applicant + research details to a Discord channel via the Bot API,
// with the generated PDF attached as a file.

export interface DiscordNotifyParams {
  botToken: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
  companyName: string;
  companyWebsite: string;
  pdfBuffer: Buffer;
  pdfFileName: string;
}

export async function sendDiscordReport(params: DiscordNotifyParams): Promise<{ ok: boolean; error?: string }> {
  const { botToken, channelId, applicantName, applicantEmail, companyName, companyWebsite, pdfBuffer, pdfFileName } = params;

  const content = [
    '**New Company Research Report Generated**',
    `**Applicant:** ${applicantName} (${applicantEmail})`,
    `**Company:** ${companyName}`,
    `**Website:** ${companyWebsite}`
  ].join('\n');

  const form = new FormData();
  form.append(
    'payload_json',
    JSON.stringify({
      content
    })
  );
  form.append('files[0]', new Blob([pdfBuffer], { type: 'application/pdf' }), pdfFileName);

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${botToken}`
    },
    body: form as any
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, error: `Discord API error (${res.status}): ${body}` };
  }

  return { ok: true };
}
