import { NextResponse } from 'next/server';
import { mutateState } from '@/lib/store';
import { recordEvent } from '@/lib/events';
import { resolveRecipient } from '@/lib/tracking';
import { readToken } from '@/lib/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const resolved = await resolveRecipient(token);
  if (!resolved) return NextResponse.redirect(new URL('/?notice=invalid-link', request.url));

  await mutateState((state) => {
    recordEvent(state, resolved.campaign.id, resolved.lead.id, 'clicked', undefined, 'deck-link');
  });

  if (resolved.campaign.deckMode === 'file') {
    return NextResponse.redirect(new URL(`/api/track/download/${token}`, request.url));
  }
  if (resolved.campaign.deckMode === 'link' && /^https?:\/\//i.test(resolved.campaign.deckUrl)) {
    return NextResponse.redirect(resolved.campaign.deckUrl);
  }
  return NextResponse.redirect(new URL('/?notice=deck-unavailable', request.url));
}
