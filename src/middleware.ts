import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const user = process.env.APP_USER;
  const pass = process.env.APP_PASS;
  if (!user || !pass) return NextResponse.next();

  const header = request.headers.get('authorization');
  if (header?.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const separator = decoded.indexOf(':');
      if (separator >= 0 && decoded.slice(0, separator) === user && decoded.slice(separator + 1) === pass) {
        return NextResponse.next();
      }
    } catch {
      return unauthorized();
    }
  }
  return unauthorized();
}

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Manufacturer Sales Email App", charset="UTF-8"' }
  });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/recipients/:path*',
    '/compose/:path*',
    '/preview/:path*',
    '/campaigns/:path*',
    '/api/leads/:path*',
    '/api/campaigns/:path*',
    '/api/preview/:path*',
    '/api/send-test/:path*',
    '/api/decks/:path*',
    '/api/followups/:path*'
  ]
};
