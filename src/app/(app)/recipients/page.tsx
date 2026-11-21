import { AppShell } from '@/components/layout/app-shell';
import { RecipientTable } from '@/components/recipients/recipient-table';
import { EmptyState } from '@/components/shared/empty-state';
import { readState } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function RecipientsPage() {
  const state = await readState();
  const active = state.imports.find((entry) => entry.id === state.activeImportId) ?? state.imports[0] ?? null;
  return (
    <AppShell
      title="Review recipients"
      description="Check validation results and exclude contacts before preparing a campaign. Opted-out contacts can never be re-included."
    >
      {active ? (
        <RecipientTable leads={active.leads} filename={active.filename} uploadedAt={active.uploadedAt} />
      ) : (
        <EmptyState
          title="No leads imported yet"
          description="Upload the manufacturer spreadsheet first to review contacts."
          actionHref="/leads"
          actionLabel="Upload leads"
        />
      )}
    </AppShell>
  );
}
