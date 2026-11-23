import { readFile } from 'node:fs/promises';
import { deckPath, readState } from './store';
import type { AppState, Campaign, DeckFile } from './types';

export const SALES_DECK_FILENAME = 'Sales_Deck.pdf';
export const SALES_DECK_MIME_TYPE = 'application/pdf';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export function deckRequested(campaign: Pick<Campaign, 'deckMode'>): boolean {
  return campaign.deckMode !== 'none';
}

function isPdfBytes(bytes: Buffer): boolean {
  return bytes.subarray(0, 5).toString('latin1') === '%PDF-';
}

function isPdfDeck(deck: DeckFile): boolean {
  return deck.mimeType === SALES_DECK_MIME_TYPE && /\.pdf$/i.test(deck.filename);
}

export function resolveSalesDeck(
  campaign: Pick<Campaign, 'deckMode' | 'deckFileId'>,
  state: AppState
): DeckFile {
  if (!deckRequested(campaign)) throw new Error('This email is configured without a sales deck');

  const selected = state.decks.find((entry) => entry.id === campaign.deckFileId);
  if (selected) {
    if (!isPdfDeck(selected)) {
      throw new Error(`The selected sales deck "${selected.filename}" is not a PDF. Upload a PDF deck before sending.`);
    }
    return selected;
  }

  const fallback = state.decks.find(isPdfDeck);
  if (!fallback) throw new Error('No sales deck PDF is available. Upload a PDF deck before sending email.');
  return fallback;
}

export async function loadSalesDeckAttachment(
  campaign: Pick<Campaign, 'deckMode' | 'deckFileId'>,
  state?: AppState
): Promise<EmailAttachment> {
  const current = state ?? await readState();
  const deck = resolveSalesDeck(campaign, current);
  let bytes: Buffer;
  try {
    bytes = await readFile(deckPath(deck.storedName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Sales deck PDF is missing from storage (${deck.filename}). Upload the deck again before sending.`);
    }
    throw error;
  }
  if (!isPdfBytes(bytes)) {
    throw new Error(`Sales deck PDF is invalid or unreadable (${deck.filename}). Upload the deck again before sending.`);
  }
  return { filename: SALES_DECK_FILENAME, content: bytes, contentType: SALES_DECK_MIME_TYPE };
}
