import { NextResponse } from 'next/server';
import { recordCtaResponse } from '@/lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const response = new URL(request.url).searchParams.get('r');
  const result = await recordCtaResponse(token, response);
  const url = new URL(result.ok ? '/responded' : '/?notice=invalid-link', request.url);
  if (result.ok) url.searchParams.set('r', result.response!);
  return NextResponse.redirect(url);
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  let response: string | null = null;
  try {
    const body = (await request.json()) as { r?: string };
    response = body.r ?? null;
  } catch {
    response = new URL(request.url).searchParams.get('r');
  }
  const result = await recordCtaResponse(token, response);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
