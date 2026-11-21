import { NextResponse } from 'next/server';
import { requireAppAuth } from '@/lib/auth';
import { metricsFor } from '@/lib/events';
import { readState } from '@/lib/store';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const state = await readState();
  const campaign = state.campaigns.find((entry) => entry.id === id);
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  return NextResponse.json({
    campaign,
    metrics: metricsFor(campaign, {
      webhooks: Boolean(process.env.WEBHOOK_SECRET),
      openTracking: process.env.OPEN_TRACKING_ENABLED === 'true',
      downloadable: campaign.deckMode === 'file'
    })
  });
}
