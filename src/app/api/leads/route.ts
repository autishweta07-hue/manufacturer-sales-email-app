import { NextResponse } from 'next/server';
import { requireAppAuth } from '@/lib/auth';
import { autoMapColumns, buildLeads, leadCounts, parseWorkbook, validateMapping } from '@/lib/leads';
import { mutateState, readState, saveUpload } from '@/lib/store';
import type { ColumnMapping } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const state = await readState();
  const active = state.imports.find((entry) => entry.id === state.activeImportId) ?? state.imports[0] ?? null;
  return NextResponse.json({ import: active, counts: active ? leadCounts(active.leads) : null });
}

export async function POST(request: Request) {
  const authError = requireAppAuth(request);
  if (authError) return authError;

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an .xlsx file to upload' }, { status: 400 });
    }
    if (!/\.xlsx?$/i.test(file.name)) {
      return NextResponse.json({ error: 'Only .xlsx files are supported' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'The file must be smaller than 10 MB' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const parsed = await parseWorkbook(bytes);
    const mapping = autoMapColumns(parsed.headers);
    const mappingErrors = validateMapping(mapping, parsed.headers);
    if (mappingErrors.length > 0) {
      return NextResponse.json({ error: mappingErrors.join(' '), headers: parsed.headers }, { status: 422 });
    }

    const state = await readState();
    const leads = buildLeads(parsed.rows, mapping, state.optOuts.map((entry) => entry.email));
    const storedName = await saveUpload(bytes, file.name);

    const imported = await mutateState((current) => {
      const entry = {
        id: `import_${Date.now().toString(36)}`,
        filename: file.name,
        storedName,
        uploadedAt: new Date().toISOString(),
        headers: parsed.headers,
        mapping,
        leads
      };
      current.imports.unshift(entry);
      current.imports = current.imports.slice(0, 10);
      current.activeImportId = entry.id;
      return entry;
    });

    return NextResponse.json({ import: imported, counts: leadCounts(imported.leads) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read the workbook';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
