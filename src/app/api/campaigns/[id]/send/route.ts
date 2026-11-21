import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAppAuth } from '@/lib/auth';
import { startCampaign } from '@/lib/campaign';
import { sendingEnabled } from '@/lib/config';
import { readState } from '@/lib/store';

export const runtime = 'nodejs';

const schema = z.object({
  confirm: z.literal(true),
  confirmToken: z.string().min(1)
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    const state = await readState();
    const campaign = state.campaigns.find((entry) => entry.id === id);
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    if (campaign.confirmToken !== input.confirmToken) {
      return NextResponse.json({ error: 'Confirmation token does not match' }, { status: 403 });
    }
    if (!sendingEnabled()) {
      return NextResponse.json({ error: 'Sending is disabled. Set ALLOW_SENDING=true only after explicit approval.' }, { status: 403 });
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
      return NextResponse.json({ error: 'Email delivery is not configured. Set SMTP settings in .env.local.' }, { status: 503 });
    }
    await startCampaign(id);
    return NextResponse.json({ status: 'sending' }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Explicit confirmation is required' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to start campaign' }, { status: 400 });
  }
}
