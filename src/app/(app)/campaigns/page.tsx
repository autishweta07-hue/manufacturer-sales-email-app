import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { CampaignStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { metricsFor } from '@/lib/events';
import { readState } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const state = await readState();
  return (
    <AppShell title="Campaigns" description="Created campaigns, their sending state and recorded outcomes.">
      {state.campaigns.length === 0 ? (
        <EmptyState title="No campaigns yet" description="Create a campaign from the preview and test screen." actionHref="/compose" actionLabel="Compose email" />
      ) : (
        <div className="surface overflow-hidden">
          <div className="border-b border-border px-5 py-4"><h2>All campaigns</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead className="bg-surface-subtle text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5">Campaign</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Created</th>
                  <th className="tabular px-3 py-2.5">Recipients</th>
                  <th className="tabular px-3 py-2.5">Sent</th>
                  <th className="tabular px-3 py-2.5">Failed</th>
                  <th className="px-5 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.campaigns.map((campaign) => {
                  const metrics = metricsFor(campaign, {
                    webhooks: Boolean(process.env.WEBHOOK_SECRET),
                    openTracking: process.env.OPEN_TRACKING_ENABLED === 'true',
                    downloadable: campaign.deckMode === 'file'
                  });
                  return (
                    <tr key={campaign.id} className="border-t border-border">
                      <td className="px-5 py-3 font-medium">{campaign.name}</td>
                      <td className="px-3 py-3"><CampaignStatusBadge status={campaign.status} /></td>
                      <td className="tabular px-3 py-3 text-muted-foreground">{formatDateTime(campaign.createdAt)}</td>
                      <td className="tabular px-3 py-3">{metrics.recipients}</td>
                      <td className="tabular px-3 py-3">{metrics.sent}</td>
                      <td className="tabular px-3 py-3">{metrics.failed}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Link href={`/campaigns/${campaign.id}`}><Button size="sm">Open</Button></Link>
                          <a href={`/api/campaigns/${campaign.id}/export`}><Button size="sm">Export</Button></a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
