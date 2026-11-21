import type { AppState, Campaign, CampaignRecipient, EventType } from './types';
import { newId } from './id';

const ONE_PER_RECIPIENT: EventType[] = ['opened', 'delivered', 'bounced', 'unsubscribed'];

export function findCampaign(state: AppState, campaignId: string): Campaign | undefined {
  return state.campaigns.find((campaign) => campaign.id === campaignId);
}

export function findRecipient(campaign: Campaign, leadId: string): CampaignRecipient | undefined {
  return campaign.recipients.find((recipient) => recipient.leadId === leadId);
}

export function recordEvent(
  state: AppState,
  campaignId: string,
  leadId: string,
  type: EventType,
  detail?: string,
  source?: string
): boolean {
  const campaign = findCampaign(state, campaignId);
  if (!campaign) return false;
  const recipient = findRecipient(campaign, leadId);
  if (!recipient) return false;
  if (
    ONE_PER_RECIPIENT.includes(type) &&
    campaign.events.some((event) => event.type === type && event.leadId === leadId)
  ) {
    return false;
  }
  campaign.events.push({
    id: newId('evt_'),
    type,
    at: new Date().toISOString(),
    campaignId,
    leadId,
    detail,
    source
  });
  return true;
}

export function metricsFor(campaign: Campaign | undefined, config: { webhooks: boolean; openTracking: boolean; downloadable: boolean }) {
  const recipients = campaign?.recipients ?? [];
  const events = campaign?.events ?? [];
  const count = (type: EventType) => events.filter((event) => event.type === type).length;
  const uniqueCount = (type: EventType) => new Set(events.filter((event) => event.type === type).map((event) => event.leadId)).size;
  return {
    recipients: recipients.length,
    sent: recipients.filter((recipient) => recipient.sendStatus === 'sent').length,
    failed: recipients.filter((recipient) => recipient.sendStatus === 'failed').length,
    pending: recipients.filter((recipient) => ['pending', 'sending'].includes(recipient.sendStatus)).length,
    delivered: { supported: config.webhooks, value: count('delivered') },
    bounced: { supported: config.webhooks, value: count('bounced') },
    opened: { supported: config.openTracking, value: uniqueCount('opened') },
    clicked: { supported: campaign?.deckMode !== 'none', value: uniqueCount('clicked') },
    downloaded: { supported: config.downloadable, value: uniqueCount('downloaded') },
    unsubscribed: uniqueCount('unsubscribed'),
    interested: recipients.filter((recipient) => recipient.response === 'interested').length,
    notInterested: recipients.filter((recipient) => recipient.response === 'not_interested').length,
    requestCall: recipients.filter((recipient) => recipient.response === 'request_call').length,
    pendingFollowUps: recipients.filter((recipient) => recipient.followUp === 'pending').length
  };
}

export type CampaignMetrics = ReturnType<typeof metricsFor>;
