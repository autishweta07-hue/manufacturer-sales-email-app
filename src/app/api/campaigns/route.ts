import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAppAuth } from '@/lib/auth';
import { createCampaign, selectableLeads } from '@/lib/campaign';
import { metricsFor } from '@/lib/events';
import { readState } from '@/lib/store';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().max(120).default('Manufacturer outreach'),
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Email body is required').max(20000),
  deckMode: z.enum(['none', 'link', 'file']),
  deckUrl: z.string().max(2000).default(''),
  deckFileId: z.string().optional(),
  leadIds: z.array(z.string()).min(1, 'Select at least one recipient'),
  batchSize: z.coerce.number().int().min(1).max(200).default(10),
  delayMs: z.coerce.number().int().min(0).max(3600000).default(1000)
});

export async function GET() {
  const state = await readState();
  const active = state.imports.find((entry) => entry.id === state.activeImportId);
  return NextResponse.json({
    campaigns: state.campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      createdAt: campaign.createdAt,
      recipientCount: campaign.recipients.length,
      metrics: metricsFor(campaign, {
        webhooks: Boolean(process.env.WEBHOOK_SECRET),
        openTracking: process.env.OPEN_TRACKING_ENABLED === 'true',
        downloadable: campaign.deckMode === 'file'
      })
    })),
    selectable: active ? selectableLeads(active.leads).map((lead) => lead.id) : []
  });
}

export async function POST(request: Request) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const input = schema.parse(await request.json());
    const campaign = await createCampaign(input);
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((entry) => entry.message).join(' ') }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create campaign' }, { status: 400 });
  }
}
