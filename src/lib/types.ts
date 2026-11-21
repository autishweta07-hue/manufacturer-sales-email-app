export type LeadStatus = 'valid' | 'invalid' | 'duplicate' | 'opted-out' | 'excluded' | 'missing';

export type CampaignStatus = 'draft' | 'sending' | 'completed';

export type SendStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';

export type ResponseType = 'interested' | 'not_interested' | 'request_call';

export type EventType =
  | 'sent'
  | 'failed'
  | 'delivered'
  | 'bounced'
  | 'opened'
  | 'clicked'
  | 'downloaded'
  | 'unsubscribed'
  | 'responded'
  | 'test_sent';

export type FollowUpStatus = 'none' | 'pending' | 'completed';

export interface Lead {
  id: string;
  sourceRow: number;
  name: string;
  email: string;
  additionalEmails: string[];
  company: string;
  phone: string;
  location: string;
  website: string;
  status: LeadStatus;
  issues: string[];
  excluded: boolean;
  optedOut: boolean;
}

export interface ColumnMapping {
  name: string;
  email: string;
  company: string;
}

export interface CampaignDraft {
  name: string;
  subject: string;
  body: string;
  deckMode: 'none' | 'link' | 'file';
  deckUrl: string;
  deckFileId: string;
  leadIds: string[];
  batchSize: number;
  delayMs: number;
}

export interface ImportBatch {
  id: string;
  filename: string;
  storedName: string;
  uploadedAt: string;
  headers: string[];
  mapping: ColumnMapping;
  leads: Lead[];
}

export interface TrackingEvent {
  id: string;
  type: EventType;
  at: string;
  campaignId: string;
  leadId: string;
  detail?: string;
  source?: string;
}

export interface CampaignRecipient {
  leadId: string;
  lead: Lead;
  token: string;
  sendStatus: SendStatus;
  attempts: number;
  sentAt?: string;
  providerMessageId?: string;
  error?: string;
  response?: ResponseType;
  respondedAt?: string;
  followUp: FollowUpStatus;
  followUpNote?: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  deckMode: 'none' | 'link' | 'file';
  deckUrl: string;
  deckFileId?: string;
  leadIds: string[];
  batchSize: number;
  delayMs: number;
  status: CampaignStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  confirmToken: string;
  recipients: CampaignRecipient[];
  events: TrackingEvent[];
}

export interface OptOut {
  email: string;
  at: string;
  source: 'import' | 'unsubscribe' | 'webhook' | 'manual';
}

export interface DeckFile {
  id: string;
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface AppState {
  version: number;
  imports: ImportBatch[];
  activeImportId: string | null;
  campaigns: Campaign[];
  optOuts: OptOut[];
  decks: DeckFile[];
}
