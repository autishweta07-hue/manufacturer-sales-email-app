import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAppAuth } from '@/lib/auth';
import { mutateState } from '@/lib/store';

export const runtime = 'nodejs';

const schema = z.object({ excluded: z.boolean() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;
    const { excluded } = schema.parse(await request.json());
    const lead = await mutateState((state) => {
      const active = state.imports.find((entry) => entry.id === state.activeImportId);
      const item = active?.leads.find((lead) => lead.id === id);
      if (!item) throw new Error('Lead not found');
      if (!excluded && (item.optedOut || ['invalid', 'missing', 'duplicate'].includes(item.status))) {
        throw new Error('This contact cannot be included in a campaign');
      }
      item.excluded = excluded;
      if (excluded && item.status === 'valid') item.status = 'excluded';
      if (!excluded && item.status === 'excluded') item.status = 'valid';
      return item;
    });
    return NextResponse.json({ lead });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update lead' }, { status: 400 });
  }
}
