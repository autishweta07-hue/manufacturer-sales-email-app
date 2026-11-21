'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SendStatusBadge } from '@/components/shared/status-badge';
import { formatDateTime } from '@/lib/utils';
import type { Campaign, CampaignRecipient } from '@/lib/types';

function eventTypes(campaign: Campaign, leadId: string): string[] {
  return Array.from(new Set(campaign.events.filter((event) => event.leadId === leadId).map((event) => event.type)));
}

function FollowUpCell({ campaign, recipient }: { campaign: Campaign; recipient: CampaignRecipient }) {
  const router = useRouter();
  const [note, setNote] = useState(recipient.followUpNote ?? '');
  const [busy, setBusy] = useState(false);

  async function update(status: 'pending' | 'completed') {
    setBusy(true);
    try {
      const response = await fetch(`/api/followups/${recipient.leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, status, note })
      });
      if (!response.ok) throw new Error('Unable to update follow-up');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Badge tone={recipient.followUp === 'pending' ? 'warning' : recipient.followUp === 'completed' ? 'success' : 'neutral'}>
        {recipient.followUp}
      </Badge>
      <Input
        aria-label={`Follow-up note for ${recipient.lead.company}`}
        placeholder="Internal note"
        className="h-8 text-[12px]"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="flex gap-1">
        <Button size="sm" variant="outline" disabled={busy} onClick={() => update('pending')}>Pending</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => update('completed')}>Done</Button>
      </div>
    </div>
  );
}

export function CampaignRecipientTable({ campaign }: { campaign: Campaign }) {
  const [query, setQuery] = useState('');
  const visible = campaign.recipients.filter((recipient) => {
    const needle = query.trim().toLowerCase();
    return !needle || [recipient.lead.company, recipient.lead.name, recipient.lead.email].some((value) => value.toLowerCase().includes(needle));
  });

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2>Recipient results</h2>
          <p className="muted mt-1">One row per recipient, built from recorded events only.</p>
        </div>
        <div className="w-full sm:w-72">
          <Input placeholder="Search recipients" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-[12px]">
          <thead className="bg-surface-subtle text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5">Company</th>
              <th className="px-3 py-2.5">Contact</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Send</th>
              <th className="px-3 py-2.5">Sent at</th>
              <th className="px-3 py-2.5">Events</th>
              <th className="px-3 py-2.5">Response</th>
              <th className="px-5 py-2.5">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((recipient) => (
              <tr key={recipient.leadId} className="border-t border-border align-top">
                <td className="px-5 py-3 font-medium">{recipient.lead.company}</td>
                <td className="px-3 py-3">{recipient.lead.name}</td>
                <td className="px-3 py-3">{recipient.lead.email}</td>
                <td className="px-3 py-3">
                  <SendStatusBadge status={recipient.sendStatus} />
                  {recipient.error && <div className="mt-1 text-[11px] text-destructive">{recipient.error}</div>}
                </td>
                <td className="tabular px-3 py-3 text-muted-foreground">{formatDateTime(recipient.sentAt)}</td>
                <td className="px-3 py-3 text-muted-foreground">{eventTypes(campaign, recipient.leadId).join(', ') || '—'}</td>
                <td className="px-3 py-3">
                  {recipient.response ? (
                    <div>
                      <Badge tone={recipient.response === 'interested' ? 'success' : recipient.response === 'request_call' ? 'primary' : 'warning'}>
                        {recipient.response.replace('_', ' ')}
                      </Badge>
                      <div className="tabular mt-1 text-[11px] text-muted-foreground">{formatDateTime(recipient.respondedAt)}</div>
                    </div>
                  ) : '—'}
                </td>
                <td className="px-5 py-3"><FollowUpCell campaign={campaign} recipient={recipient} /></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No recipients match this search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
