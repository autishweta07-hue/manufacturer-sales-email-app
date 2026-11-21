import { createHmac, timingSafeEqual } from 'node:crypto';

export type TokenPurpose = 'recipient' | 'open' | 'click' | 'download' | 'unsubscribe' | 'respond';

export interface TokenPayload {
  c: string;
  l: string;
  p: TokenPurpose;
}

function secret(): string {
  const value = process.env.TRACKING_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('TRACKING_SECRET must be set to at least 16 characters in production');
  }
  return 'development-only-tracking-secret-change-me';
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function createToken(payload: TokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function readToken(token: string | null | undefined): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    if (!payload.c || !payload.l || !payload.p) return null;
    return payload;
  } catch {
    return null;
  }
}

export function assertPurpose(payload: TokenPayload, purpose: TokenPurpose): boolean {
  return payload.p === purpose;
}
