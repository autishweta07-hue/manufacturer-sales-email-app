import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAppAuth } from '@/lib/auth';
import { buildLeads, leadCounts, parseWorkbook } from '@/lib/leads';
import { mutateState, readState, uploadPath } from '@/lib/store';
import { readFile } from 'node:fs/promises';
import type { ColumnMapping } from '@/lib/types';

export const runtime = 'nodejs';

const schema = z.object({
  mapping: z.object({ name: z.string(), email: z.string(), company: z.string() })
});

export async function POST(request: Request) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const body = schema.parse(await request.json());
    const state = await readState();
    const active = state.imports.find((entry) => entry.id === state.activeImportId);
    if (!active) return NextResponse.json({ error: 'No active import' }, { status: 404 });
    const mapping = body.mapping as ColumnMapping;
    for (const value of Object.values(mapping)) {
      if (value && !active.headers.includes(value)) {
        return NextResponse.json({ error: `Unknown column: ${value}` }, { status: 400 });
      }
    }
    const buffer = await readFile(uploadPath(active.storedName));
    const parsed = await parseWorkbook(buffer);
    const leads = buildLeads(parsed.rows, mapping, state.optOuts.map((entry) => entry.email));
    const updated = await mutateState((current) => {
      const entry = current.imports.find((item) => item.id === active.id);
      if (!entry) throw new Error('Import no longer exists');
      entry.mapping = mapping;
      entry.leads = leads;
      return entry;
    });
    return NextResponse.json({ import: updated, counts: leadCounts(leads) });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid mapping payload' }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to remap columns' }, { status: 400 });
  }
}
