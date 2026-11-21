import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AutoRefresh } from '@/components/dashboard/auto-refresh';
import { CampaignRecipientTable } from '@/components/dashboard/campaign-recipient-table';
import { MetricCard } from '@/components/shared/metric-card';
import { CampaignStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { metricsFor } from '@/lib/events';
import { readState } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const state = await readState();
  const campaign = state.campaigns.find((entry) => entry.id === id);
  if (!campaign) notFound();
  const metrics = metricsFor(campaign, {
    webhooks: Boolean(process.env.WEBHOOK_SECRET),
    openTracking: process.env.OPEN_TRACKING_ENABLED === 'true',
    downloadable: campaign.deckMode === 'file'
  });
  const progress = metrics.recipients ? Math.round(((metrics.sent + metrics.failed) / metrics.recipients) * 100) : 0;

  return (
    <AppShell title={campaign.name} description={`Campaign ${campaign.id} · created ${formatDateTime(campaign.createdAt)}`}>
      <AutoRefresh active={campaign.status === 'sending'} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CampaignStatusBadge status={campaign.status} />
          <span className="tabular text-[13px] text-muted-foreground">{progress}% processed · batch {campaign.batchSize} · delay {campaign.delayMs} ms</span>
        </div>
        <a href={`/api/campaigns/${campaign.id}/export`}><Button>Export Excel</Button></a>
      </div>
      <div className="mb-7 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Recipients" value={metrics.recipients} basis="Selected after review" />
        <MetricCard label="Sent" value={metrics.sent} basis="Recorded SMTP success" />
        <MetricCard label="Failed" value={metrics.failed} basis="Recorded send failures" />
        <MetricCard label="Pending" value={metrics.pending} basis="Not yet attempted" />
      </div>
      <div className="mb-7"><CampaignRecipientTable campaign={campaign} /></div>
      <div className="surface overflow-hidden">
        <div className="border-b border-border px-5 py-4"><h2>Event log</h2></div>
        <div className="max-h-80 overflow-y-auto">
          {campaign.events.length === 0 && <p className="px-5 py-6 text-[13px] text-muted-foreground">No events recorded yet.</p>}
          {campaign.events.map((event) => (
            <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-2 text-[12px] last:border-b-0">
              <span className="font-medium">{event.type}</span>
              <span className="text-muted-foreground">{campaign.recipients.find((item) => item.leadId === event.leadId)?.lead.email}</span>
              <span className="tabular text-muted-foreground">{formatDateTime(event.at)} · {event.source ?? 'app'}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
