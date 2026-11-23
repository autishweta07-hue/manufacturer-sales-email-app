import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadSalesDeckAttachment } from '../src/lib/deck';
import { deliverEmail, renderEmail } from '../src/lib/email';
import { DEFAULT_CAMPAIGN_DRAFT } from '../src/lib/template';
import type { AppState, Campaign, DeckFile, Lead } from '../src/lib/types';

process.env.TRACKING_SECRET = 'test-secret-at-least-16-characters';
process.env.EMAIL_FROM = 'Test Sender <sender@example.com>';

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

const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n');

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp_test',
    name: 'Test campaign',
    subject: DEFAULT_CAMPAIGN_DRAFT.subject,
    body: DEFAULT_CAMPAIGN_DRAFT.body,
    deckMode: 'file',
    deckUrl: '',
    deckFileId: 'deck_1',
    leadIds: [lead.id],
    batchSize: 1,
    delayMs: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    confirmToken: 'confirm_test',
    recipients: [],
    events: [],
    ...overrides
  };
}

function deckFile(storedName: string): DeckFile {
  return {
    id: 'deck_1',
    filename: 'Company Deck.pdf',
    storedName,
    mimeType: 'application/pdf',
    size: pdf.length,
    uploadedAt: new Date().toISOString()
  };
}

async function withStoredDeck(): Promise<{ dir: string; restore: () => void }> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'email-app-deck-'));
  const previous = process.env.DATA_DIR;
  process.env.DATA_DIR = dir;
  const { mutateState, saveDeck } = await import('../src/lib/store');
  const saved = await saveDeck(pdf, 'Company Deck.pdf');
  await mutateState((state: AppState) => {
    state.decks = [deckFile(saved.storedName)];
  });
  return {
    dir,
    restore: () => {
      if (previous === undefined) delete process.env.DATA_DIR;
      else process.env.DATA_DIR = previous;
    }
  };
}

test('sales deck is rendered as a PDF attachment with no deck hyperlink', () => {
  const rendered = renderEmail(
    campaign({ deckUrl: 'https://drive.example.com/deck' }),
    lead,
    'token'
  );

  assert.match(DEFAULT_CAMPAIGN_DRAFT.body, /Please find our company sales deck attached for your reference\./);
  assert.doesNotMatch(DEFAULT_CAMPAIGN_DRAFT.body, /https?:\/\//);
  assert.equal(rendered.attachmentName, 'Sales_Deck.pdf');
  assert.match(rendered.text, /Attachment: Sales_Deck\.pdf \(PDF file attached to this email\)/);
  assert.doesNotMatch(rendered.html, /PDF attachment: Sales_Deck\.pdf/);
  assert.doesNotMatch(rendered.text, /Sales deck: https?:\/\//);
  assert.doesNotMatch(rendered.html, /View the sales deck/);
  assert.doesNotMatch(rendered.html, /drive\.example\.com/);
  assert.doesNotMatch(rendered.text, /\/api\/track\/(click|download)\//);
  assert.doesNotMatch(rendered.html, /\/api\/track\/(click|download)\//);

  const legacy = renderEmail(
    campaign({ deckMode: 'link', deckUrl: 'https://example.com/deck' }),
    lead,
    'token'
  );
  assert.equal(legacy.attachmentName, 'Sales_Deck.pdf');
  assert.doesNotMatch(legacy.html, /https:\/\/example\.com\/deck/);
  assert.doesNotMatch(legacy.text, /https:\/\/example\.com\/deck/);
});

test('sales deck attachment is loaded from stored PDF with a fixed filename', async () => {
  const { dir, restore } = await withStoredDeck();
  try {
    const attachment = await loadSalesDeckAttachment(campaign());
    assert.deepEqual(attachment, {
      filename: 'Sales_Deck.pdf',
      content: pdf,
      contentType: 'application/pdf'
    });

    const fallback = await loadSalesDeckAttachment(campaign({ deckFileId: '' }));
    assert.equal(fallback.filename, 'Sales_Deck.pdf');

    await assert.rejects(
      () => loadSalesDeckAttachment(campaign({ deckMode: 'none' })),
      /configured without a sales deck/
    );

    const { mutateState } = await import('../src/lib/store');
    await mutateState((state: AppState) => {
      state.decks = [];
    });
    await assert.rejects(
      () => loadSalesDeckAttachment(campaign()),
      /No sales deck PDF is available/
    );

    await mutateState((state: AppState) => {
      state.decks = [{ ...deckFile('missing.pdf') }];
    });
    await assert.rejects(
      () => loadSalesDeckAttachment(campaign()),
      /missing from storage/
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
    restore();
  }
});

test('deliverEmail creates multipart MIME with a real application/pdf attachment', async () => {
  const { dir, restore } = await withStoredDeck();
  try {
    const rendered = renderEmail(campaign(), lead, 'token');
    const attachment = await loadSalesDeckAttachment(campaign());
    let mailOptions: SendMailOptions | undefined;
    const capture = {
      sendMail: async (options: SendMailOptions) => {
        mailOptions = options;
        return { messageId: 'test-id', response: 'ok' };
      }
    } as unknown as Transporter;

    await deliverEmail(capture, rendered, lead.email, attachment);
    assert.ok(mailOptions);

    const stream = nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
      newline: 'unix'
    });
    const info = await stream.sendMail(mailOptions);
    const raw = Buffer.isBuffer(info.message) ? info.message.toString('utf8') : String(info.message);

    assert.match(raw, /^Content-Type: multipart\/mixed;/m);
    assert.match(raw, /Content-Type: multipart\/alternative;/);
    assert.match(raw, /Content-Disposition: attachment;\s*filename="?Sales_Deck\.pdf"?/);
    assert.match(raw, /Content-Type: application\/pdf/);
    assert.match(raw, /JVBERi0/);
    assert.doesNotMatch(raw, /\/api\/track\/(click|download)\//);
  } finally {
    await rm(dir, { recursive: true, force: true });
    restore();
  }
});

test('deliverEmail refuses to send an email that requires a missing attachment', async () => {
  const rendered = renderEmail(campaign(), lead, 'token');
  const transporter = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'unix'
  });

  await assert.rejects(
    () => deliverEmail(transporter, rendered, lead.email),
    /must be attached before this email can be sent/
  );
});
