import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAppAuth } from '@/lib/auth';
import { mutateState } from '@/lib/store';

export const runtime = 'nodejs';

const schema = z.object({
  campaignId: z.string().min(1),
  status: z.enum(['pending', 'completed']),
  note: z.string().max(2000).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ leadId: string }> }) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const { leadId } = await context.params;
    const input = schema.parse(await request.json());
    const recipient = await mutateState((state) => {
      const campaign = state.campaigns.find((entry) => entry.id === input.campaignId);
      const item = campaign?.recipients.find((entry) => entry.leadId === leadId);
      if (!item) throw new Error('Recipient not found');
      item.followUp = input.status;
      if (input.note !== undefined) item.followUpNote = input.note;
      return item;
    });
    return NextResponse.json({ recipient });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update follow-up' }, { status: 400 });
  }
}
