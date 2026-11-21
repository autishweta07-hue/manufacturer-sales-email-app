'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LeadStatusBadge } from '@/components/shared/status-badge';
import { formatDateTime } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/lib/types';

type Filter = 'all' | LeadStatus;

const filters: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'valid', label: 'Valid' },
  { key: 'invalid', label: 'Invalid' },
  { key: 'missing', label: 'Missing' },
  { key: 'duplicate', label: 'Duplicates' },
  { key: 'opted-out', label: 'Opted out' },
  { key: 'excluded', label: 'Excluded' }
];

export function RecipientTable({ leads, filename, uploadedAt }: { leads: Lead[]; filename: string; uploadedAt: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function toggle(lead: Lead) {
    setBusyId(lead.id);
    setError('');
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excluded: !lead.excluded })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update recipient');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update recipient');
    } finally {
      setBusyId(null);
    }
  }

  const visible = leads.filter((lead) => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      [lead.company, lead.name, lead.email].some((value) => value.toLowerCase().includes(needle));
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2>Recipients</h2>
          <p className="muted mt-1">
            {filename} · imported {formatDateTime(uploadedAt)} · {leads.length} rows
          </p>
        </div>
        <Link href="/compose">
          <Button variant="primary">Continue to composer</Button>
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
        {filters.map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${
              filter === item.key ? 'bg-primary text-primary-foreground' : 'bg-surface-subtle text-muted-foreground'
            }`}
          >
            {item.label}
            <span className="tabular ml-1.5 opacity-70">
              {item.key === 'all' ? leads.length : leads.filter((lead) => lead.status === item.key).length}
            </span>
          </button>
        ))}
        <div className="ml-auto w-full sm:w-64">
          <Input placeholder="Search company, contact or email" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
      </div>
      {error && <p className="px-5 pt-3 text-[13px] text-destructive">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-[13px]">
          <thead className="bg-surface-subtle text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5">Row</th>
              <th className="px-3 py-2.5">Company</th>
              <th className="px-3 py-2.5">Contact</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Checks</th>
              <th className="px-5 py-2.5">Include</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((lead) => (
              <tr key={lead.id} className="border-t border-border align-top">
                <td className="tabular px-5 py-3 text-muted-foreground">{lead.sourceRow}</td>
                <td className="px-3 py-3 font-medium">{lead.company || '—'}</td>
                <td className="px-3 py-3">{lead.name || '—'}</td>
                <td className="px-3 py-3">
                  <div>{lead.email || '—'}</div>
                  {lead.additionalEmails.length > 0 && (
                    <div className="text-[11px] text-muted-foreground">+{lead.additionalEmails.length} more address(es)</div>
                  )}
                </td>
                <td className="px-3 py-3"><LeadStatusBadge status={lead.status} /></td>
                <td className="px-3 py-3 text-[12px] text-muted-foreground">
                  {lead.issues.length ? lead.issues.join(' · ') : '—'}
                </td>
                <td className="px-5 py-3">
                  <Button
                    size="sm"
                    variant={lead.excluded ? 'secondary' : 'outline'}
                    disabled={busyId === lead.id || (lead.status !== 'valid' && lead.status !== 'excluded')}
                    onClick={() => toggle(lead)}
                    title={lead.excluded ? 'Include this recipient' : 'Exclude this recipient'}
                  >
                    {lead.excluded ? 'Excluded' : 'Included'}
                  </Button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                  No recipients match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
        <span>Showing {visible.length} of {leads.length}</span>
        <Badge tone="primary">{leads.filter((lead) => lead.status === 'valid').length} eligible</Badge>
      </div>
    </div>
  );
}
