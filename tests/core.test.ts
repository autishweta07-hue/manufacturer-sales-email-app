import assert from 'node:assert/strict';
import test from 'node:test';
import { isEmail, normalizeEmail, splitEmails } from '../src/lib/utils';
import { assertPurpose, createToken, readToken } from '../src/lib/tokens';
import { escapeHtml, personalize, textToHtmlParagraphs } from '../src/lib/personalize';
import { normalizeProviderEvents } from '../src/lib/provider-events';
import { DEFAULT_CAMPAIGN_DRAFT, TEMPLATE_GUIDANCE } from '../src/lib/template';
import { sendingEnabled } from '../src/lib/config';
import type { Lead } from '../src/lib/types';

const lead: Lead = {
  id: 'lead_1',
  sourceRow: 2,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  additionalEmails: [],
  company: 'Analytical Engines',
  phone: '',
  location: '',
  website: '',
  status: 'valid',
  issues: [],
  excluded: false,
  optedOut: false
};

test('email helpers normalise and validate addresses', () => {
  assert.equal(normalizeEmail('  <Ada@Example.COM> '), 'ada@example.com');
  assert.equal(isEmail('ada@example.com'), true);
  assert.equal(isEmail('not-an-email'), false);
  assert.deepEqual(splitEmails('ada@example.com / grace@example.com; hopper@example.com'), [
    'ada@example.com',
    'grace@example.com',
    'hopper@example.com'
  ]);
});

test('personalization replaces known variables and reports unresolved ones', () => {
  const result = personalize('Hi {{Name}} at {{Company_Name}} ({{Email}}) {{Unknown}}', lead);
  assert.equal(result.value, 'Hi Ada Lovelace at Analytical Engines (ada@example.com) {{Unknown}}');
  assert.deepEqual(result.unresolved, ['{{Unknown}}']);
});

test('html conversion escapes user input', () => {
  assert.equal(escapeHtml('<b>&"\'</b>'), '&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt;');
  assert.equal(textToHtmlParagraphs('Hello\nworld'), '<p style="margin:0 0 16px 0;">Hello<br>world</p>');
});

test('tracking tokens round-trip and reject tampering', () => {
  process.env.TRACKING_SECRET = 'test-secret-at-least-16-characters';
  const token = createToken({ c: 'camp_1', l: 'lead_1', p: 'unsubscribe' });
  const payload = readToken(token);
  assert.ok(payload);
  assert.equal(assertPurpose(payload, 'unsubscribe'), true);
  assert.equal(assertPurpose(payload, 'respond'), false);
  const tampered = `${token.slice(0, -2)}xx`;
  assert.equal(readToken(tampered), null);
});

test('outbound sending is disabled unless explicitly enabled', () => {
  delete process.env.ALLOW_SENDING;
  assert.equal(sendingEnabled(), false);
  process.env.ALLOW_SENDING = 'true';
  assert.equal(sendingEnabled(), true);
  delete process.env.ALLOW_SENDING;
});

test('recommended sales template is ready to edit and uses verified placeholders', () => {
  const draft = DEFAULT_CAMPAIGN_DRAFT;
  assert.match(draft.subject, /\{\{Company_Name\}\}/);
  assert.match(draft.body, /\{\{Name\}\}/);
  assert.match(draft.body, /\{\{Company_Name\}\}/);
  assert.match(draft.body, /\[YOUR COMPANY\]/);
  assert.match(draft.body, /\[ONE-SENTENCE DESCRIPTION OF YOUR OFFERING/);
  assert.notEqual(draft.deckMode, 'none');
  assert.ok(TEMPLATE_GUIDANCE.length >= 3);
});

test('provider webhooks normalise SendGrid, Postmark and SNS', () => {
  const sendgrid = normalizeProviderEvents([
    { email: 'ada@example.com', event: 'delivered', 'smtp-id': 'msg_1', campaign: { id: 'camp_1' }, lead: { id: 'lead_1' } }
  ]);
  assert.deepEqual(sendgrid[0], {
    type: 'delivered',
    email: 'ada@example.com',
    messageId: 'msg_1',
    campaignId: 'camp_1',
    leadId: 'lead_1'
  });

  const postmark = normalizeProviderEvents({ RecordType: 'Bounce', Recipient: 'ada@example.com' });
  assert.equal(postmark[0].type, 'bounced');
  assert.equal(postmark[0].email, 'ada@example.com');

  const sns = normalizeProviderEvents({
    Type: 'Notification',
    Message: JSON.stringify({
      eventType: 'delivery',
      mail: { destination: ['ada@example.com'], messageId: 'msg_1' },
      delivery: { recipients: ['ada@example.com'] }
    })
  });
  assert.equal(sns[0].type, 'delivered');
  assert.equal(sns[0].email, 'ada@example.com');
});
