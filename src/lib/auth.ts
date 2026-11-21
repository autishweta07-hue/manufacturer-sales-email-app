import { timingSafeEqual } from 'node:crypto';

export function appAuthConfigured(): boolean {
  return Boolean(process.env.APP_USER && process.env.APP_PASS);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function authorized(authorizationHeader: string | null | undefined): boolean {
  if (!appAuthConfigured()) return true;
  if (!authorizationHeader?.startsWith('Basic ')) return false;
  try {
    const decoded = Buffer.from(authorizationHeader.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return false;
    const user = decoded.slice(0, separator);
    const pass = decoded.slice(separator + 1);
    return safeEqual(user, process.env.APP_USER!) && safeEqual(pass, process.env.APP_PASS!);
  } catch {
    return false;
  }
}

export function unauthorizedResponse(): Response {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Manufacturer Sales Email App", charset="UTF-8"' }
  });
}

export function requireAppAuth(request: Request): Response | null {
  return authorized(request.headers.get('authorization')) ? null : unauthorizedResponse();
}
