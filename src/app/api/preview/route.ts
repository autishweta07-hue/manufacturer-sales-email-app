import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAppAuth } from '@/lib/auth';
import { renderEmail } from '@/lib/email';
import { campaignToken } from '@/lib/email';
import { readState } from '@/lib/store';
import type { Campaign } from '@/lib/types';

export const runtime = 'nodejs';

const schema = z.object({
  subject: z.string().default(''),
  body: z.string().default(''),
  leadId: z.string().min(1),
  deckMode: z.enum(['none', 'link', 'file']).default('none'),
  deckUrl: z.string().default(''),
  deckFileId: z.string().optional()
});

export async function POST(request: Request) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const input = schema.parse(await request.json());
    const state = await readState();
    const active = state.imports.find((entry) => entry.id === state.activeImportId);
    const lead = active?.leads.find((entry) => entry.id === input.leadId);
    if (!lead) return NextResponse.json({ error: 'Recipient not found in the active import' }, { status: 404 });

    const stub: Campaign = {
      id: 'preview',
      name: 'Preview',
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
      confirmToken: 'preview',
      recipients: [],
      events: []
    };
    const rendered = renderEmail(stub, lead, campaignToken('preview', lead.id));
    return NextResponse.json({
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      unresolved: rendered.unresolved,
      unsubscribeUrl: rendered.unsubscribeUrl,
      attachmentName: rendered.attachmentName
    });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid preview request' }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Preview failed' }, { status: 400 });
  }
}
