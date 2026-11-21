import type { EventType } from './types';

export interface NormalizedEvent {
  type: EventType;
  email?: string;
  messageId?: string;
  campaignId?: string;
  leadId?: string;
}

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : null;
}

function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return undefined;
}

function mapEvent(value: string | undefined): EventType | null {
  const map: Record<string, EventType> = {
    delivered: 'delivered',
    delivery: 'delivered',
    bounce: 'bounced',
    bounced: 'bounced',
    permanent_bounce: 'bounced',
    open: 'opened',
    opened: 'opened',
    click: 'clicked',
    clicked: 'clicked',
    unsubscribe: 'unsubscribed',
    unsubscribed: 'unsubscribed',
    spamcomplaint: 'unsubscribed'
  };
  if (!value) return null;
  return map[value.toLowerCase()] ?? null;
}

function fromGeneric(payload: Json): NormalizedEvent[] {
  const event = mapEvent(str(payload.event ?? payload.type ?? payload.eventType));
  if (!event) return [];
  return [{ type: event, email: str(payload.email ?? payload.recipient), messageId: str(payload.messageId), campaignId: str(payload.campaignId), leadId: str(payload.leadId) }];
}

function fromSendGrid(payload: unknown[]): NormalizedEvent[] {
  return payload.map((item) => {
    const entry = asRecord(item) ?? {};
    return {
      type: mapEvent(str(entry.event)) ?? 'failed',
      email: str(entry.email),
      messageId: str(entry['smtp-id'] ?? entry.messageId),
      campaignId: str(asRecord(entry.campaign)?.id),
      leadId: str(asRecord(entry.lead)?.id)
    };
  }).filter((event) => event.type !== 'failed');
}

function fromPostmark(payload: Json): NormalizedEvent[] {
  const type = mapEvent(str(payload.RecordType));
  if (!type) return [];
  const metadata = asRecord(payload.Metadata) ?? {};
  return [
    {
      type,
      email: str(payload.Recipient),
      messageId: str(payload.MessageID),
      campaignId: str(metadata.campaignId),
      leadId: str(metadata.leadId)
    }
  ];
}

function fromMailgun(payload: Json): NormalizedEvent[] {
  const type = mapEvent(str(payload.event));
  if (!type) return [];
  const tags = payload.tags;
  const campaignTag = Array.isArray(tags) ? str(tags.find((tag) => str(tag)?.startsWith('campaign:'))) : undefined;
  return [
    {
      type,
      email: str(payload.recipient),
      messageId: str(payload['message-id']),
      campaignId: campaignTag?.replace(/^campaign:/, '')
    }
  ];
}

function fromSns(payload: Json): NormalizedEvent[] {
  let parsedMessage: unknown = payload.Message;
  if (typeof parsedMessage === 'string') {
    try {
      parsedMessage = JSON.parse(parsedMessage);
    } catch {
      return [];
    }
  }
  const message = asRecord(parsedMessage) ?? payload;
  const type = mapEvent(str(message.eventType));
  if (!type) return [];
  const mail = asRecord(message.mail) ?? {};
  const destination = mail.destination;
  const email = Array.isArray(destination) ? str(destination[0]) : undefined;
  const metadata = asRecord(message.metadata) ?? {};
  return [
    {
      type,
      email,
      messageId: str(mail.messageId),
      campaignId: str(metadata.campaignId),
      leadId: str(metadata.leadId)
    }
  ];
}

export function normalizeProviderEvents(payload: unknown): NormalizedEvent[] {
  const body = asRecord(payload);
  if (!body) return Array.isArray(payload) ? fromSendGrid(payload as unknown[]) : [];
  if (Array.isArray(payload)) return fromSendGrid(payload as unknown[]);
  if ('RecordType' in body) return fromPostmark(body);
  if ('Message' in body && str(body.Type) === 'Notification') return fromSns(body);
  if ('event' in body && ('recipient' in body || 'message-id' in body)) return fromMailgun(body);
  return fromGeneric(body);
}

export function isSnsConfirmation(payload: unknown): string | null {
  const body = asRecord(payload);
  if (!body || str(body.Type) !== 'SubscriptionConfirmation') return null;
  const url = str(body.SubscribeURL);
  return url && /^https:\/\/[a-z0-9.-]+\.amazonaws\.com\//i.test(url) ? url : null;
}
