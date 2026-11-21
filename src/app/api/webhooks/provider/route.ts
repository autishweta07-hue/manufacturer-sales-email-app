import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { recordEvent } from '@/lib/events';
import { isSnsConfirmation, normalizeProviderEvents } from '@/lib/provider-events';
import { mutateState, readState } from '@/lib/store';
import { normalizeEmail } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function secretMatches(value: string | null): boolean {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected || !value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get('x-webhook-secret'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const confirmationUrl = isSnsConfirmation(payload);
  if (confirmationUrl) {
    try {
      await fetch(confirmationUrl, { method: 'GET' });
      return NextResponse.json({ confirmed: true });
    } catch {
      return NextResponse.json({ error: 'Could not confirm subscription' }, { status: 502 });
    }
  }

  const events = normalizeProviderEvents(payload);
  await mutateState((state) => {
    events.forEach((event) => {
      const campaign = state.campaigns.find((entry) =>
        event.campaignId
          ? entry.id === event.campaignId
          : entry.recipients.some(
              (recipient) =>
                Boolean(event.messageId && recipient.providerMessageId === event.messageId) ||
                Boolean(event.email && normalizeEmail(recipient.lead.email) === normalizeEmail(event.email))
            )
      );
      if (!campaign) return;
      const recipient = campaign.recipients.find((entry) =>
        event.leadId
          ? entry.leadId === event.leadId
          : Boolean(event.messageId && entry.providerMessageId === event.messageId) ||
            Boolean(event.email && normalizeEmail(entry.lead.email) === normalizeEmail(event.email))
      );
      if (!recipient) return;
      recordEvent(state, campaign.id, recipient.leadId, event.type, event.messageId, 'webhook');
      if (event.type === 'unsubscribed') {
        const email = normalizeEmail(recipient.lead.email);
        if (!state.optOuts.some((entry) => entry.email === email)) {
          state.optOuts.push({ email, at: new Date().toISOString(), source: 'webhook' });
        }
      }
    });
  });

  return NextResponse.json({ received: events.length });
}
