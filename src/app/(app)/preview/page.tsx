import { AppShell } from '@/components/layout/app-shell';
import { PreviewPanel } from '@/components/preview/preview-panel';
import { EmptyState } from '@/components/shared/empty-state';
import { readState } from '@/lib/store';
import { selectableLeads } from '@/lib/campaign';
import { sendingEnabled } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function PreviewPage() {
  const state = await readState();
  const active = state.imports.find((entry) => entry.id === state.activeImportId) ?? state.imports[0] ?? null;
  const leads = active ? selectableLeads(active.leads) : [];
  return (
    <AppShell
      title="Preview and test"
      description="Render the final personalised message, send a test email, then create and explicitly confirm a campaign."
    >
      {active ? (
        <PreviewPanel
          sendingEnabled={sendingEnabled()}
          leads={leads.map((lead) => ({ id: lead.id, company: lead.company, name: lead.name, email: lead.email }))}
        />
      ) : (
        <EmptyState title="Nothing to preview" description="Upload leads and compose an email first." actionHref="/leads" actionLabel="Upload leads" />
      )}
    </AppShell>
  );
}
