import { recordEvent } from './events';
import { mutateState } from './store';
import { resolveRecipient } from './tracking';
import type { ResponseType } from './types';
import { normalizeEmail } from './utils';

const RESPONSES: ResponseType[] = ['interested', 'not_interested', 'request_call'];

export async function recordCtaResponse(
  token: string,
  response: string | null
): Promise<{ ok: boolean; response?: ResponseType }> {
  if (!response || !RESPONSES.includes(response as ResponseType)) return { ok: false };
  const resolved = await resolveRecipient(token);
  if (!resolved) return { ok: false };
  const typed = response as ResponseType;
  await mutateState((state) => {
    const campaign = state.campaigns.find((entry) => entry.id === resolved.campaign.id);
    const recipient = campaign?.recipients.find((entry) => entry.leadId === resolved.lead.id);
    if (!campaign || !recipient || recipient.response) return;
    recipient.response = typed;
    recipient.respondedAt = new Date().toISOString();
    if (typed === 'request_call') recipient.followUp = 'pending';
    recordEvent(state, campaign.id, resolved.lead.id, 'responded', typed, 'cta');
  });
  return { ok: true, response: typed };
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const resolved = await resolveRecipient(token);
  if (!resolved) return false;
  const email = normalizeEmail(resolved.lead.email);
  await mutateState((state) => {
    if (!state.optOuts.some((entry) => entry.email === email)) {
      state.optOuts.push({ email, at: new Date().toISOString(), source: 'unsubscribe' });
    }
    state.imports.forEach((entry) => {
      entry.leads.forEach((lead) => {
        if (normalizeEmail(lead.email) === email) {
          lead.optedOut = true;
          if (lead.status === 'valid' || lead.status === 'excluded') lead.status = 'opted-out';
          lead.excluded = true;
        }
      });
    });
    recordEvent(state, resolved.campaign.id, resolved.lead.id, 'unsubscribed', email, 'one-click');
  });
  return true;
}
