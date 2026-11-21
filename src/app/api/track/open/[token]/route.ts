import { mutateState } from '@/lib/store';
import { recordEvent } from '@/lib/events';
import { resolveRecipient } from '@/lib/tracking';
import { readToken } from '@/lib/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const payload = readToken(token);
  if (payload && process.env.OPEN_TRACKING_ENABLED === 'true') {
    await mutateState((state) => {
      recordEvent(state, payload.c, payload.l, 'opened', undefined, 'pixel');
    });
  }
  return new Response(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Length': String(PIXEL.length)
    }
  });
}
