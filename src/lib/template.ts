import type { CampaignDraft } from './types';

export const DRAFT_KEY = 'manufacturer-outreach-draft-v1';

export const DEFAULT_CAMPAIGN_DRAFT: CampaignDraft = {
  name: 'Manufacturer outreach',
  subject: '{{Company_Name}} — a brief introduction from [YOUR COMPANY]',
  body: [
    'Hello {{Name}},',
    '',
    'I’m [YOUR NAME], [YOUR ROLE] at [YOUR COMPANY]. We work with manufacturers on [ONE-SENTENCE DESCRIPTION OF YOUR OFFERING — REPLACE WITH VERIFIED COPY].',
    '',
    'I’m reaching out because {{Company_Name}} operates in [RELEVANT SECTOR / MARKET]. I thought this might be useful given [SPECIFIC, VERIFIED REASON FOR REACHING OUT].',
    '',
    'I’ve included our sales deck below for a quick review. If the fit looks useful, would you be open to a 15-minute call next week?',
    '',
    'Regards,',
    '[YOUR NAME]',
    '[YOUR ROLE] | [YOUR COMPANY]',
    '[PHONE] | [EMAIL]'
  ].join('\n'),
  deckMode: 'link',
  deckUrl: '',
  deckFileId: '',
  leadIds: [],
  batchSize: 5,
  delayMs: 1000
};

export const TEMPLATE_GUIDANCE = [
  'Replace every [BRACKETED PLACEHOLDER] with verified business information.',
  '{{Name}} and {{Company_Name}} are filled automatically for each recipient.',
  'The sales deck link or attachment, response buttons and unsubscribe link are added automatically.'
];
