import { NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const ok = await unsubscribeByToken(token);
  return NextResponse.redirect(new URL(ok ? '/unsubscribed' : '/?notice=invalid-link', request.url));
}

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const ok = await unsubscribeByToken(token);
  return new Response(ok ? 'Unsubscribed' : 'Invalid link', { status: ok ? 200 : 400 });
}
