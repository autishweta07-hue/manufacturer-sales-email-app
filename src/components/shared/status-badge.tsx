import { Badge } from '@/components/ui/badge';
import type { CampaignStatus, LeadStatus, SendStatus } from '@/lib/types';

const tones = {
  valid: 'success',
  invalid: 'destructive',
  missing: 'destructive',
  duplicate: 'warning',
  'opted-out': 'warning',
  excluded: 'neutral'
} as const;

const sendTones = {
  pending: 'neutral',
  sending: 'primary',
  sent: 'success',
  failed: 'destructive',
  skipped: 'neutral'
} as const;

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={tones[status]}>{status === 'opted-out' ? 'Opted out' : status}</Badge>;
}

export function SendStatusBadge({ status }: { status: SendStatus }) {
  return <Badge tone={sendTones[status]}>{status}</Badge>;
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge tone={status === 'completed' ? 'success' : status === 'sending' ? 'primary' : 'neutral'}>{status}</Badge>;
}
