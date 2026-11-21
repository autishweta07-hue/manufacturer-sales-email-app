import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/shared/metric-card';
import { CampaignStatusBadge } from '@/components/shared/status-badge';
import { AutoRefresh } from '@/components/dashboard/auto-refresh';
import { CampaignRecipientTable } from '@/components/dashboard/campaign-recipient-table';
import { Button } from '@/components/ui/button';
import { metricsFor } from '@/lib/events';
import { leadCounts } from '@/lib/leads';
import { readState } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function measured(label: string, metric: { supported: boolean; value: number }, note: string) {
  return metric.supported ? (
    <MetricCard key={label} label={label} value={metric.value} basis={note} />
  ) : (
    <MetricCard key={label} label={label} value="Not available" basis="Not configured or unsupported" hint="No provider event source is configured for this metric. This is not a zero count." />
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ campaign?: string }> }) {
  const state = await readState();
  const { campaign: selectedId } = await searchParams;
  const campaign = state.campaigns.find((entry) => entry.id === selectedId) ?? state.campaigns[0];
  const activeImport = state.imports.find((entry) => entry.id === state.activeImportId) ?? state.imports[0] ?? null;
  const counts = activeImport ? leadCounts(activeImport.leads) : null;
  const metrics = campaign
    ? metricsFor(campaign, {
        webhooks: Boolean(process.env.WEBHOOK_SECRET),
        openTracking: process.env.OPEN_TRACKING_ENABLED === 'true',
        downloadable: campaign.deckMode === 'file'
      })
    : null;

  return (
    <AppShell
      title="Overview"
      description="Campaign results built from recorded sends, provider events and recipient responses. Unsupported metrics are labelled, never shown as zero."
    >
      {!campaign ? (
        <EmptyState title="No campaign yet" description="Upload leads, compose an email and confirm a campaign to see results here." actionHref="/leads" actionLabel="Start with leads" />
      ) : (
        <>
          <AutoRefresh active={campaign.status === 'sending'} />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2>{campaign.name}</h2>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              <p className="muted mt-1">Created {formatDateTime(campaign.createdAt)} · {campaign.recipients.length} recipients</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.campaigns.slice(0, 5).map((item) => (
                <Link key={item.id} href={`/dashboard?campaign=${item.id}`}>
                  <Button size="sm" variant={item.id === campaign.id ? 'primary' : 'outline'}>{item.name}</Button>
                </Link>
              ))}
              <a href={`/api/campaigns/${campaign.id}/export`}>
                <Button size="sm">Export Excel</Button>
              </a>
            </div>
          </div>

          <section className="mb-7">
            <div className="eyebrow mb-3">Lead import</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Total leads uploaded" value={counts?.total ?? 0} basis={activeImport?.filename ?? 'No file imported'} />
              <MetricCard label="Valid leads" value={counts?.valid ?? 0} basis="Eligible before manual exclusion" />
              <MetricCard label="Invalid / missing" value={counts?.invalid ?? 0} basis="Excluded from sending" />
              <MetricCard label="Duplicates" value={counts?.duplicate ?? 0} basis="Same email repeated" />
              <MetricCard label="Opted out" value={counts?.optedOut ?? 0} basis="Permanently excluded" />
              <MetricCard label="Excluded manually" value={counts?.excluded ?? 0} basis="Excluded during review" />
            </div>
          </section>

          <section className="mb-7">
            <div className="eyebrow mb-3">Campaign activity</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Emails sent" value={metrics!.sent} basis={`${metrics!.failed} failed · ${metrics!.pending} pending`} />
              {measured('Delivered', metrics!.delivered, 'Provider webhook events')}
              {measured('Bounced', metrics!.bounced, 'Provider webhook events')}
              {measured('Opens (unique)', metrics!.opened, 'Approximate · pixel may be blocked')}
              {measured('Deck clicks (unique)', metrics!.clicked, 'Tracked link redirects')}
              {measured('Deck downloads (unique)', metrics!.downloaded, 'Tracked file delivery')}
              <MetricCard label="Unsubscribed" value={metrics!.unsubscribed} basis="One-click opt-outs" />
              <MetricCard label="Interested" value={metrics!.interested} basis="CTA responses" />
              <MetricCard label="Not interested" value={metrics!.notInterested} basis="CTA responses" />
              <MetricCard label="Request a call" value={metrics!.requestCall} basis="CTA responses" />
              <MetricCard label="Pending follow-ups" value={metrics!.pendingFollowUps} basis="Marked by the sales team" />
            </div>
            {process.env.OPEN_TRACKING_ENABLED === 'true' && (
              <p className="muted mt-3">Open tracking is enabled. Open counts are approximate: privacy tools and image blocking can prevent or inflate them.</p>
            )}
          </section>

          <CampaignRecipientTable campaign={campaign} />
        </>
      )}
    </AppShell>
  );
}
