import { NextResponse } from 'next/server';
import { requireAppAuth } from '@/lib/auth';
import { mutateState, saveDeck, newId } from '@/lib/store';

export const runtime = 'nodejs';

const ALLOWED = /\.pdf$/i;

export async function POST(request: Request) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a deck file' }, { status: 400 });
    if (!ALLOWED.test(file.name)) return NextResponse.json({ error: 'Only PDF sales decks are supported' }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'Deck must be smaller than 25 MB' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return NextResponse.json({ error: 'The uploaded file is not a valid PDF' }, { status: 400 });
    }
    const saved = await saveDeck(bytes, file.name);
    const deck = {
      id: newId('deck_'),
      filename: file.name,
      storedName: saved.storedName,
      mimeType: saved.mimeType,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
    await mutateState((state) => {
      state.decks.unshift(deck);
      state.decks = state.decks.slice(0, 10);
    });
    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 400 });
  }
}
