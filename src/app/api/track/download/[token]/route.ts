import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { recordEvent } from '@/lib/events';
import { deckPath, mutateState, readState } from '@/lib/store';
import { resolveRecipient } from '@/lib/tracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const resolved = await resolveRecipient(token);
  if (!resolved) return new Response('Invalid link', { status: 404 });
  const deckFileId = resolved.campaign.deckFileId;
  if (!deckFileId) return new Response('No deck is attached to this campaign', { status: 404 });

  const state = await readState();
  const deck = state.decks.find((entry) => entry.id === deckFileId);
  if (!deck) return new Response('Deck file is no longer available', { status: 404 });

  let bytes: Buffer;
  try {
    bytes = await readFile(deckPath(deck.storedName));
  } catch {
    return new Response('Deck file is no longer available', { status: 404 });
  }

  await mutateState((current) => {
    recordEvent(current, resolved.campaign.id, resolved.lead.id, 'downloaded', deck.filename, 'deck-download');
  });

  return new Response(bytes as unknown as BodyInit, {
    headers: {
      'Content-Type': deck.mimeType,
      'Content-Disposition': `inline; filename="${deck.filename.replace(/"/g, '')}"`,
      'Cache-Control': 'no-store'
    }
  });
}
