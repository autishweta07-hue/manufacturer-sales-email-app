import type { CampaignDraft } from './types';

export const DRAFT_KEY = 'manufacturer-outreach-draft-v1';

export const DEFAULT_CAMPAIGN_DRAFT: CampaignDraft = {
  name: 'Manufacturer outreach',
  subject: 'A question for the person who built {{Company_Name}}',
  body: [
    'Hello {{Name}},',
    '',
    "I've been reading about {{Company_Name}}, Building a manufacturing business that lasts is rare, and I'd like to learn from how you've done it.",
    '',
    'I’m [YOUR NAME], [YOUR ROLE] at [YOUR COMPANY]. We work with manufacturers on [ONE-SENTENCE DESCRIPTION OF YOUR OFFERING — REPLACE WITH VERIFIED COPY].',
    '',
    'I’m reaching out because {{Company_Name}} operates in [RELEVANT SECTOR / MARKET]. I thought this might be useful given [SPECIFIC, VERIFIED REASON FOR REACHING OUT].',
    '',
    'Please find our company sales deck attached for your reference. If the fit looks useful, would you be open to a 15-minute call next week?',
    '',
    'Regards,',
    '[YOUR NAME]',
    '[YOUR ROLE] | [YOUR COMPANY]',
    '[PHONE] | [EMAIL]'
  ].join('\n'),
  deckMode: 'file',
  deckUrl: '',
  deckFileId: '',
  leadIds: [],
  batchSize: 5,
  delayMs: 1000
};

export const TEMPLATE_GUIDANCE = [
  'Replace every [BRACKETED PLACEHOLDER] with verified business information.',
  '{{Name}} and {{Company_Name}} are filled from the Excel person name and company name columns for each recipient.',
  'A missing or NaN person name is replaced with "there" in the greeting.',
  'The sales deck is attached automatically as Sales_Deck.pdf; response buttons and the unsubscribe link are added automatically.'
];
