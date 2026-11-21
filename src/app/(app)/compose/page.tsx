import { AppShell } from '@/components/layout/app-shell';
import { ComposerForm } from '@/components/compose/composer-form';
import { EmptyState } from '@/components/shared/empty-state';
import { readState } from '@/lib/store';
import { selectableLeads } from '@/lib/campaign';

export const dynamic = 'force-dynamic';

export default async function ComposePage() {
  const state = await readState();
  const active = state.imports.find((entry) => entry.id === state.activeImportId) ?? state.imports[0] ?? null;
  const leads = active ? selectableLeads(active.leads) : [];
  return (
    <AppShell
      title="Compose email"
      description="Write one message, then personalise it separately for every recipient. Variables are resolved at preview and send time."
    >
      {active ? (
        <ComposerForm
          leads={leads.map((lead) => ({ id: lead.id, name: lead.name, company: lead.company, email: lead.email }))}
          decks={state.decks.map((deck) => ({ id: deck.id, filename: deck.filename, size: deck.size }))}
        />
      ) : (
        <EmptyState title="No leads to write to" description="Upload and review a lead list first." actionHref="/leads" actionLabel="Upload leads" />
      )}
    </AppShell>
  );
}
