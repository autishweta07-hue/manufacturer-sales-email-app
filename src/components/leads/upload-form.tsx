'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { MetricCard } from '@/components/shared/metric-card';
import type { ColumnMapping } from '@/lib/types';

interface Counts {
  total: number;
  valid: number;
  invalid: number;
  duplicate: number;
  optedOut: number;
  excluded: number;
}

interface Props {
  filename: string | null;
  headers: string[];
  mapping: ColumnMapping | null;
  counts: Counts | null;
}

const emptyMapping: ColumnMapping = { name: '', email: '', company: '' };

export function UploadForm({ filename, headers, mapping, counts }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [currentHeaders, setHeaders] = useState(headers);
  const [currentMapping, setMapping] = useState<ColumnMapping>(mapping ?? emptyMapping);
  const [currentCounts, setCounts] = useState<Counts | null>(counts);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/leads', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      setHeaders(data.import.headers);
      setMapping(data.import.mapping);
      setCounts(data.counts);
      setNotice(`${data.counts.total} rows read from ${data.import.filename}`);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function applyMapping() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/leads/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapping: currentMapping })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Mapping failed');
      setCounts(data.counts);
      setNotice('Column mapping applied and leads revalidated');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mapping failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2>Source spreadsheet</h2>
            <p className="muted mt-1">Upload the first relevant worksheet. The app reads rows, maps columns and validates addresses.</p>
          </div>
          {filename && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e6f2eb] px-2.5 py-1 text-[12px] font-medium text-[#1c5d40]">
              <CheckCircle2 size={14} /> {filename}
            </span>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <Label htmlFor="lead-file">Excel file (.xlsx)</Label>
            <Input
              id="lead-file"
              ref={inputRef}
              type="file"
              accept=".xlsx"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <Button variant="primary" onClick={upload} disabled={!file || busy}>
            <Upload size={15} /> {busy ? 'Working…' : 'Upload and validate'}
          </Button>
        </div>
        {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}
        {notice && <p className="mt-3 text-[13px] text-success">{notice}</p>}
      </section>

      {currentHeaders.length > 0 && (
        <section className="surface px-5 py-5">
          <h2>Column mapping</h2>
          <p className="muted mt-1">Confirm which spreadsheet columns hold the contact name, email and company name.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(['name', 'email', 'company'] as const).map((field) => (
              <div key={field}>
                <Label htmlFor={`map-${field}`}>{field === 'name' ? '{{Name}}' : field === 'email' ? '{{Email}}' : '{{Company_Name}}'}</Label>
                <Select
                  id={`map-${field}`}
                  value={currentMapping[field]}
                  onChange={(event) => setMapping({ ...currentMapping, [field]: event.target.value })}
                >
                  <option value="">Select a column…</option>
                  {currentHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={applyMapping} disabled={busy}>Apply mapping</Button>
            <Link href="/recipients">
              <Button variant="primary">Review recipients</Button>
            </Link>
          </div>
        </section>
      )}

      {currentCounts && (
        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Total rows" value={currentCounts.total} basis="Imported from the worksheet" />
            <MetricCard label="Valid" value={currentCounts.valid} basis="Ready for review" />
            <MetricCard label="Invalid or missing" value={currentCounts.invalid} basis="Never emailed" />
            <MetricCard label="Duplicates" value={currentCounts.duplicate} basis="Same email appears more than once" />
            <MetricCard label="Opted out" value={currentCounts.optedOut} basis="Permanently excluded" />
            <MetricCard label="Excluded manually" value={currentCounts.excluded} basis="Excluded by the sales user" />
          </div>
        </section>
      )}
    </div>
  );
}
