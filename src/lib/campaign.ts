import { sendingEnabled } from './config';
import { deckRequested, loadSalesDeckAttachment } from './deck';
import { createTransporter, deliverEmail, isTransientSmtpError, renderEmail } from './email';
import { recordEvent } from './events';
import { mutateState, newId, readState } from './store';
import { campaignToken } from './email';
import type { Campaign, CampaignRecipient, Lead } from './types';
import { safeErrorMessage, sleep } from './utils';

export interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  deckMode: 'none' | 'link' | 'file';
  deckUrl: string;
  deckFileId?: string;
  leadIds: string[];
  batchSize: number;
  delayMs: number;
}

const running = globalThis as unknown as { __campaignsRunning?: Set<string> };
if (!running.__campaignsRunning) running.__campaignsRunning = new Set<string>();

export function selectableLeads(leads: Lead[]): Lead[] {
  return leads.filter(
    (lead) => lead.status === 'valid' && !lead.excluded && !lead.optedOut
  );
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  return mutateState((state) => {
    const importBatch = state.imports.find((entry) => entry.id === state.activeImportId);
    if (!importBatch) throw new Error('Upload a lead list before creating a campaign');
    const allowed = new Set(selectableLeads(importBatch.leads).map((lead) => lead.id));
    const leads = importBatch.leads.filter((lead) => input.leadIds.includes(lead.id) && allowed.has(lead.id));
    if (leads.length === 0) throw new Error('Select at least one valid, non-excluded recipient');

    const campaignId = newId('camp_');
    const recipients: CampaignRecipient[] = leads.map((lead) => ({
      leadId: lead.id,
      lead,
      token: campaignToken(campaignId, lead.id),
      sendStatus: 'pending',
      attempts: 0,
      followUp: 'none'
    }));
    const campaign: Campaign = {
      id: campaignId,
      name: input.name.trim() || 'Untitled campaign',
      subject: input.subject,
      body: input.body,
      deckMode: input.deckMode,
      deckUrl: input.deckUrl,
      deckFileId: input.deckFileId,
      leadIds: leads.map((lead) => lead.id),
      batchSize: Math.max(1, Math.min(200, input.batchSize)),
      delayMs: Math.max(0, Math.min(3_600_000, input.delayMs)),
      status: 'draft',
      createdAt: new Date().toISOString(),
      confirmToken: newId('confirm_'),
      recipients,
      events: []
    };
    state.campaigns.unshift(campaign);
    state.campaigns = state.campaigns.slice(0, 100);
    return campaign;
  });
}

export async function startCampaign(campaignId: string): Promise<void> {
  if (!sendingEnabled()) throw new Error('Sending is disabled. Set ALLOW_SENDING=true only after explicit approval.');
  await mutateState(async (state) => {
    const campaign = state.campaigns.find((entry) => entry.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.status === 'sending') throw new Error('Campaign is already sending');
    if (campaign.status === 'completed') throw new Error('Campaign has already completed');
    if (deckRequested(campaign)) await loadSalesDeckAttachment(campaign, state);
    campaign.recipients.forEach((recipient) => {
      if (recipient.sendStatus === 'sending') recipient.sendStatus = 'pending';
      if (recipient.sendStatus === 'sent') recipient.sendStatus = 'sent';
    });
    campaign.status = 'sending';
    campaign.startedAt = new Date().toISOString();
  });
  void runCampaign(campaignId);
}

export async function runCampaign(campaignId: string): Promise<void> {
  if (running.__campaignsRunning!.has(campaignId)) return;
  running.__campaignsRunning!.add(campaignId);

  try {
    const state = await readState();
    const campaign = state.campaigns.find((entry) => entry.id === campaignId);
    if (!campaign || campaign.status !== 'sending') return;

    const attachment = deckRequested(campaign) ? await loadSalesDeckAttachment(campaign, state) : undefined;
    const transporter = createTransporter();
    let processedInBatch = 0;

    for (const recipient of campaign.recipients) {
      if (recipient.sendStatus !== 'pending') continue;

      const claimed = await mutateState((current) => {
        const target = current.campaigns.find((entry) => entry.id === campaignId);
        const item = target?.recipients.find((entry) => entry.leadId === recipient.leadId);
        if (!target || !item || item.sendStatus !== 'pending') return false;
        item.sendStatus = 'sending';
        item.attempts = 0;
        return true;
      });
      if (!claimed) continue;

      const rendered = renderEmail(campaign, recipient.lead, recipient.token);
      let lastError = '';

      if (rendered.unresolved.length > 0) {
        lastError = `Unresolved placeholders: ${rendered.unresolved.join(', ')}`;
      } else {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          try {
            const result = await deliverEmail(transporter, rendered, recipient.lead.email, attachment);
            await mutateState((current) => {
              const target = current.campaigns.find((entry) => entry.id === campaignId);
              const item = target?.recipients.find((entry) => entry.leadId === recipient.leadId);
              if (!target || !item) return;
              item.sendStatus = 'sent';
              item.sentAt = new Date().toISOString();
              item.providerMessageId = result.messageId;
              item.attempts = attempt;
              delete item.error;
              recordEvent(current, campaignId, recipient.leadId, 'sent', undefined, 'smtp');
            });
            lastError = '';
            break;
          } catch (error) {
            lastError = safeErrorMessage(error);
            const transient = isTransientSmtpError(error);
            await mutateState((current) => {
              const target = current.campaigns.find((entry) => entry.id === campaignId);
              const item = target?.recipients.find((entry) => entry.leadId === recipient.leadId);
              if (target && item) item.attempts = attempt;
            });
            if (!transient || attempt === 3) break;
            await sleep(500 * attempt);
          }
        }
      }

      if (lastError) {
        await mutateState((current) => {
          const target = current.campaigns.find((entry) => entry.id === campaignId);
          const item = target?.recipients.find((entry) => entry.leadId === recipient.leadId);
          if (!target || !item) return;
          item.sendStatus = 'failed';
          item.error = lastError;
          recordEvent(current, campaignId, recipient.leadId, 'failed', lastError, 'smtp');
        });
      }

      processedInBatch += 1;
      if (campaign.delayMs > 0 && processedInBatch >= campaign.batchSize) {
        processedInBatch = 0;
        await sleep(campaign.delayMs);
      }
    }

    await mutateState((current) => {
      const target = current.campaigns.find((entry) => entry.id === campaignId);
      if (!target) return;
      target.status = 'completed';
      target.completedAt = new Date().toISOString();
    });
  } catch (error) {
    const message = safeErrorMessage(error);
    await mutateState((current) => {
      const target = current.campaigns.find((entry) => entry.id === campaignId);
      if (!target) return;
      target.recipients.forEach((recipient) => {
        if (recipient.sendStatus === 'pending' || recipient.sendStatus === 'sending') {
          recipient.sendStatus = 'failed';
          recipient.error = message;
          recordEvent(current, campaignId, recipient.leadId, 'failed', message, 'attachment');
        }
      });
      target.status = 'completed';
      target.completedAt = new Date().toISOString();
    });
  } finally {
    running.__campaignsRunning!.delete(campaignId);
  }
}

export async function campaignSnapshot(campaignId: string): Promise<Campaign | undefined> {
  const state = await readState();
  return state.campaigns.find((campaign) => campaign.id === campaignId);
}
