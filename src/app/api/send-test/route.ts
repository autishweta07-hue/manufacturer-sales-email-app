import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAppAuth } from '@/lib/auth';
import { sendingEnabled } from '@/lib/config';
import { deckRequested, loadSalesDeckAttachment } from '@/lib/deck';
import { createTransporter, deliverEmail, renderEmail } from '@/lib/email';
import { campaignToken } from '@/lib/email';
import { readState } from '@/lib/store';
import type { Campaign } from '@/lib/types';

export const runtime = 'nodejs';

const schema = z.object({
  to: z.string().email(),
  leadId: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  deckMode: z.enum(['none', 'link', 'file']),
  deckUrl: z.string().default(''),
  deckFileId: z.string().optional()
});

export async function POST(request: Request) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const input = schema.parse(await request.json());
    if (!sendingEnabled()) {
      return NextResponse.json({ error: 'Test sending is disabled. Set ALLOW_SENDING=true only after explicit approval.' }, { status: 403 });
    }
    const state = await readState();
    const active = state.imports.find((entry) => entry.id === state.activeImportId);
    const lead = active?.leads.find((entry) => entry.id === input.leadId);
    if (!lead) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });

    const stub: Campaign = {
      id: 'test',
      name: 'Test email',
      subject: input.subject,
      body: input.body,
      deckMode: input.deckMode,
      deckUrl: input.deckUrl,
      deckFileId: input.deckFileId,
      leadIds: [lead.id],
      batchSize: 1,
      delayMs: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      confirmToken: 'test',
      recipients: [],
      events: []
    };
    const rendered = renderEmail(stub, lead, campaignToken('test', lead.id));
    if (rendered.unresolved.length > 0) {
      return NextResponse.json({ error: `Unresolved placeholders: ${rendered.unresolved.join(', ')}` }, { status: 422 });
    }
    const attachment = deckRequested(stub) ? await loadSalesDeckAttachment(stub, state) : undefined;
    const transporter = createTransporter();
    const result = await deliverEmail(transporter, rendered, input.to, attachment);
    return NextResponse.json({ messageId: result.messageId, to: input.to });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Enter a valid test email address' }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Test email failed' }, { status: 502 });
  }
}
