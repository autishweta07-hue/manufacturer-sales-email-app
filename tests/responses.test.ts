import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import type { AppState, Lead } from '../src/lib/types';

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

test('CTA responses and unsubscribe links mutate stored records', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'email-app-responses-'));
  process.env.DATA_DIR = dir;
  process.env.TRACKING_SECRET = 'test-secret-at-least-16-characters';
  try {
    const { mutateState, readState } = await import('../src/lib/store');
    const { createToken } = await import('../src/lib/tokens');
    const { recordCtaResponse, unsubscribeByToken } = await import('../src/lib/responses');

    const token = createToken({ c: 'camp_1', l: lead.id, p: 'recipient' });
    await mutateState((state: AppState) => {
      state.imports = [{
        id: 'import_1',
        filename: 'leads.xlsx',
        storedName: 'leads.xlsx',
        uploadedAt: new Date().toISOString(),
        headers: [],
        mapping: { name: 'Contact', email: 'Email', company: 'Company' },
        leads: [lead]
      }];
      state.activeImportId = 'import_1';
      state.campaigns = [{
        id: 'camp_1',
        name: 'Test',
        subject: 'Hi',
        body: 'Body',
        deckMode: 'link',
        deckUrl: 'https://example.com/deck',
        leadIds: [lead.id],
        batchSize: 5,
        delayMs: 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
        confirmToken: 'confirm_1',
        recipients: [{ leadId: lead.id, lead, token, sendStatus: 'sent', attempts: 1, followUp: 'none' }],
        events: []
      }];
    });

    const response = await recordCtaResponse(token, 'request_call');
    assert.deepEqual(response, { ok: true, response: 'request_call' });

    let state = await readState();
    assert.equal(state.campaigns[0].recipients[0].response, 'request_call');
    assert.equal(state.campaigns[0].recipients[0].followUp, 'pending');
    assert.ok(state.campaigns[0].events.some((event) => event.type === 'responded'));

    assert.deepEqual(await recordCtaResponse(token, 'interested'), { ok: true, response: 'interested' });
    state = await readState();
    assert.equal(state.campaigns[0].recipients[0].response, 'request_call');

    assert.equal(await unsubscribeByToken(token), true);
    state = await readState();
    assert.ok(state.optOuts.some((entry) => entry.email === 'ada@example.com'));
    assert.equal(state.imports[0].leads[0].optedOut, true);
    assert.equal(state.imports[0].leads[0].excluded, true);
    assert.ok(state.campaigns[0].events.some((event) => event.type === 'unsubscribed'));
    assert.equal(await unsubscribeByToken(token), true);
    state = await readState();
    assert.equal(state.optOuts.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
