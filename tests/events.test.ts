import assert from 'node:assert/strict';
import test from 'node:test';
import { metricsFor, recordEvent } from '../src/lib/events';
import type { AppState, Campaign, Lead } from '../src/lib/types';

const lead: Lead = {
  id: 'lead_1',
  sourceRow: 2,
  name: 'Ada',
  email: 'ada@example.com',
  additionalEmails: [],
  company: 'Acme',
  phone: '',
  location: '',
  website: '',
  status: 'valid',
  issues: [],
  excluded: false,
  optedOut: false
};

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp_1',
    name: 'Test',
    subject: 'Hi',
    body: 'Body',
    deckMode: 'link',
    deckUrl: 'https://example.com/deck',
    leadIds: [lead.id],
    batchSize: 10,
    delayMs: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    confirmToken: 'confirm_1',
    recipients: [{ leadId: lead.id, lead, token: 'token', sendStatus: 'sent', attempts: 1, followUp: 'pending' }],
    events: [],
    ...overrides
  };
}

test('recordEvent de-duplicates one-per-recipient events', () => {
  const state: AppState = { version: 1, imports: [], activeImportId: null, campaigns: [campaign()], optOuts: [], decks: [] };
  assert.equal(recordEvent(state, 'camp_1', 'lead_1', 'opened'), true);
  assert.equal(recordEvent(state, 'camp_1', 'lead_1', 'opened'), false);
  assert.equal(recordEvent(state, 'camp_1', 'lead_1', 'clicked'), true);
  assert.equal(state.campaigns[0].events.length, 2);
});

test('metrics mark unsupported signals instead of reporting zero', () => {
  const withEvents = campaign({
    events: [
      { id: 'e1', type: 'opened', at: '', campaignId: 'camp_1', leadId: 'lead_1' },
      { id: 'e2', type: 'clicked', at: '', campaignId: 'camp_1', leadId: 'lead_1' },
      { id: 'e3', type: 'unsubscribed', at: '', campaignId: 'camp_1', leadId: 'lead_1' }
    ],
    recipients: [
      {
        leadId: lead.id,
        lead,
        token: 'token',
        sendStatus: 'sent',
        attempts: 1,
        followUp: 'none',
        response: 'request_call'
      }
    ]
  });
  const metrics = metricsFor(withEvents, { webhooks: false, openTracking: false, downloadable: false });
  assert.equal(metrics.sent, 1);
  assert.equal(metrics.delivered.supported, false);
  assert.equal(metrics.bounced.supported, false);
  assert.equal(metrics.opened.supported, false);
  assert.equal(metrics.clicked.supported, true);
  assert.equal(metrics.clicked.value, 1);
  assert.equal(metrics.downloaded.supported, false);
  assert.equal(metrics.unsubscribed, 1);
  assert.equal(metrics.requestCall, 1);
});
