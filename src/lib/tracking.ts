import { readToken } from './tokens';
import { readState } from './store';
import type { Campaign, CampaignRecipient, Lead } from './types';

export interface ResolvedRecipient {
  campaign: Campaign;
  recipient: CampaignRecipient;
  lead: Lead;
}

export async function resolveRecipient(token: string | undefined): Promise<ResolvedRecipient | null> {
  const payload = readToken(token);
  if (!payload || payload.p !== 'recipient') return null;
  const state = await readState();
  const campaign = state.campaigns.find((entry) => entry.id === payload.c);
  if (!campaign) return null;
  const recipient = campaign.recipients.find((entry) => entry.leadId === payload.l);
  if (!recipient) return null;
  return { campaign, recipient, lead: recipient.lead };
}
