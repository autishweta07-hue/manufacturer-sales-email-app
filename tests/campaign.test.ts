import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import type { AppState, Lead } from '../src/lib/types';

function makeLead(id: string, overrides: Partial<Lead> = {}): Lead {
  return {
    id,
    sourceRow: Number(id.replace(/\D/g, '')) || 1,
    name: 'Ada',
    email: `${id}@example.com`,
    additionalEmails: [],
    company: 'Acme',
    phone: '',
    location: '',
    website: '',
    status: 'valid',
    issues: [],
    excluded: false,
    optedOut: false,
    ...overrides
  };
}

test('createCampaign snapshots only eligible recipients and issues a confirmation token', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'email-app-test-'));
  process.env.DATA_DIR = dir;
  process.env.TRACKING_SECRET = 'test-secret-at-least-16-characters';
  try {
    const { mutateState } = await import('../src/lib/store');
    const { createCampaign, selectableLeads, startCampaign } = await import('../src/lib/campaign');

    const leads = [
      makeLead('lead_1'),
      makeLead('lead_2', { status: 'invalid' }),
      makeLead('lead_3', { excluded: true }),
      makeLead('lead_4', { optedOut: true })
    ];
    await mutateState((state: AppState) => {
      state.imports = [{
        id: 'import_1',
        filename: 'leads.xlsx',
        storedName: 'leads.xlsx',
        uploadedAt: new Date().toISOString(),
        headers: [],
        mapping: { name: 'Contact', email: 'Email', company: 'Company' },
        leads
      }];
      state.activeImportId = 'import_1';
    });

    assert.equal(selectableLeads(leads).length, 1);

    const campaign = await createCampaign({
      name: 'October outreach',
      subject: 'Hello {{Company_Name}}',
      body: 'Hi {{Name}}',
      deckMode: 'none',
      deckUrl: '',
      leadIds: leads.map((lead) => lead.id),
      batchSize: 10,
      delayMs: 0
    });

    assert.equal(campaign.status, 'draft');
    assert.equal(campaign.recipients.length, 1);
    assert.equal(campaign.recipients[0].leadId, 'lead_1');
    assert.equal(campaign.recipients[0].sendStatus, 'pending');
    assert.ok(campaign.confirmToken.startsWith('confirm_'));
    assert.ok(campaign.recipients[0].token.includes('.'));

    delete process.env.ALLOW_SENDING;
    await assert.rejects(() => startCampaign(campaign.id), /Sending is disabled/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
