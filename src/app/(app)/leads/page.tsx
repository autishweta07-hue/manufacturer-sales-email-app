import { AppShell } from '@/components/layout/app-shell';
import { UploadForm } from '@/components/leads/upload-form';
import { readState } from '@/lib/store';
import { leadCounts } from '@/lib/leads';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const state = await readState();
  const active = state.imports.find((entry) => entry.id === state.activeImportId) ?? state.imports[0] ?? null;
  return (
    <AppShell
      title="Upload leads"
      description="Import the manufacturer list, confirm the column mapping and check data quality before any campaign."
    >
      <UploadForm
        filename={active?.filename ?? null}
        headers={active?.headers ?? []}
        mapping={active?.mapping ?? null}
        counts={active ? leadCounts(active.leads) : null}
      />
    </AppShell>
  );
}
