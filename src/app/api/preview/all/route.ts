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
  deckMode: z.enum(['none', 'link', 'file']).default('none'),
  deckUrl: z.string().default(''),
  deckFileId: z.string().optional(),
  leadIds: z.array(z.string()).min(1).max(500)
});

function stub(input: z.infer<typeof schema>): Campaign {
  return {
    id: 'preview',
    name: 'Preview',
    subject: input.subject,
    body: input.body,
    deckMode: input.deckMode,
    deckUrl: input.deckUrl,
    deckFileId: input.deckFileId,
    leadIds: input.leadIds,
    batchSize: 1,
    delayMs: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    confirmToken: 'preview',
    recipients: [],
    events: []
  };
}

export async function POST(request: Request) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const input = schema.parse(await request.json());
    const state = await readState();
    const active = state.imports.find((entry) => entry.id === state.activeImportId);
    const leads = active?.leads.filter((lead) => input.leadIds.includes(lead.id)) ?? [];
    const campaign = stub(input);
    const previews = leads.map((lead) => {
      const rendered = renderEmail(campaign, lead, campaignToken('preview', lead.id));
      return {
        leadId: lead.id,
        company: lead.company,
        name: lead.name,
        email: lead.email,
        subject: rendered.subject,
        body: rendered.body,
        unresolved: rendered.unresolved,
        attachmentName: rendered.attachmentName
      };
    });
    return NextResponse.json({ previews });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid preview request' }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Preview failed' }, { status: 400 });
  }
}
