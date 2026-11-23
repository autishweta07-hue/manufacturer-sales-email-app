'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PERSONALIZATION_VARIABLES } from '@/lib/personalize';
import { DEFAULT_CAMPAIGN_DRAFT, DRAFT_KEY, TEMPLATE_GUIDANCE } from '@/lib/template';
import type { CampaignDraft } from '@/lib/types';

export { DRAFT_KEY };
export type { CampaignDraft };

interface EligibleLead {
  id: string;
  name: string;
  company: string;
  email: string;
}

interface Deck {
  id: string;
  filename: string;
  size: number;
}

export function ComposerForm({ leads, decks }: { leads: EligibleLead[]; decks: Deck[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CampaignDraft>(() => ({
    ...DEFAULT_CAMPAIGN_DRAFT,
    deckFileId: decks[0]?.id ?? ''
  }));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const deckFile = useRef<HTMLInputElement>(null);
  const initialDecks = useRef(decks);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CampaignDraft;
        const restored = { ...DEFAULT_CAMPAIGN_DRAFT, ...parsed, deckMode: 'file' as const };
        if (!restored.deckFileId && initialDecks.current.length > 0) restored.deckFileId = initialDecks.current[0].id;
        setDraft(restored);
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  function update<K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function insertVariable(variable: string, field: 'subject' | 'body') {
    update(field, `${draft[field]}${draft[field] && !draft[field].endsWith(' ') ? ' ' : ''}${variable}`);
  }

  function persist() {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  function resetTemplate() {
    update('subject', DEFAULT_CAMPAIGN_DRAFT.subject);
    update('body', DEFAULT_CAMPAIGN_DRAFT.body);
    setNotice('Recommended template restored');
  }

  function validate(): string | null {
    if (!draft.subject.trim()) return 'Add a subject line';
    if (!draft.body.trim()) return 'Add an email body';
    if (draft.leadIds.length === 0) return 'Select at least one eligible recipient';
    if (draft.deckMode !== 'file' || !draft.deckFileId) return 'Choose a PDF sales deck to attach';
    return null;
  }

  function next() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    persist();
    router.push('/preview');
  }

  async function uploadDeck() {
    const file = deckFile.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/decks', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Deck upload failed');
      update('deckFileId', data.deck.id);
      update('deckMode', 'file');
      setNotice(`Uploaded ${data.deck.filename}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deck upload failed');
    } finally {
      setBusy(false);
    }
  }

  function toggleLead(id: string) {
    const selected = draft.leadIds.includes(id);
    update(
      'leadIds',
      selected ? draft.leadIds.filter((entry) => entry !== id) : [...draft.leadIds, id]
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="surface px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2>Message</h2>
            <Button size="sm" onClick={resetTemplate}>Use recommended template</Button>
          </div>
          <p className="muted mt-1">A ready-to-edit manufacturer outreach template is preloaded. Replace every bracketed placeholder with verified business information.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="campaign-name">Campaign name</Label>
              <Input id="campaign-name" value={draft.name} onChange={(event) => update('name', event.target.value)} />
            </div>
            <div>
              <Label htmlFor="batch-size">Batch size</Label>
              <Input
                id="batch-size"
                type="number"
                min={1}
                max={200}
                value={draft.batchSize}
                onChange={(event) => update('batchSize', Number(event.target.value))}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="subject">Subject line</Label>
            <Input id="subject" value={draft.subject} onChange={(event) => update('subject', event.target.value)} />
          </div>
          <div className="mt-4">
            <Label htmlFor="body">Email body</Label>
            <Textarea
              id="body"
              rows={12}
              value={draft.body}
              onChange={(event) => update('body', event.target.value)}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-muted-foreground">Insert variable</span>
            {PERSONALIZATION_VARIABLES.map((variable) => (
              <Badge key={variable} tone="primary" className="cursor-pointer" onClick={() => insertVariable(variable, 'subject')} title="Insert into subject">
                {variable}
              </Badge>
            ))}
            <span className="text-[11px] text-muted-foreground">click to add to subject · edit freely in the body</span>
          </div>
        </section>

        <section className="surface px-5 py-5">
          <h2>Sales deck</h2>
          <p className="muted mt-1">The sales deck is attached to every email as Sales_Deck.pdf. No external link is included.</p>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] flex-1">
                <Label htmlFor="deck-file">Sales deck PDF</Label>
                <Input id="deck-file" ref={deckFile} type="file" accept=".pdf,application/pdf" />
              </div>
              <Button onClick={uploadDeck} disabled={busy}>
                <Paperclip size={15} /> Upload deck
              </Button>
            </div>
            <div>
              <Label htmlFor="deck-select">Choose uploaded deck</Label>
              <Select id="deck-select" value={draft.deckFileId} onChange={(event) => update('deckFileId', event.target.value)}>
                <option value="">Choose an uploaded deck…</option>
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>{deck.filename}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="delay">Delay between batches (ms)</Label>
            <Input
              id="delay"
              type="number"
              min={0}
              step={250}
              value={draft.delayMs}
              onChange={(event) => update('delayMs', Number(event.target.value))}
            />
          </div>
        </section>

        <section className="surface px-5 py-5">
          <div className="flex items-center justify-between">
            <h2>Recipients</h2>
            <Badge tone="primary">{draft.leadIds.length} selected</Badge>
          </div>
          <div className="mt-4 max-h-72 overflow-y-auto rounded-[8px] border border-border">
            {leads.map((lead) => (
              <label key={lead.id} className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2 last:border-b-0 text-[13px]">
                <input
                  type="checkbox"
                  checked={draft.leadIds.includes(lead.id)}
                  onChange={() => toggleLead(lead.id)}
                  className="h-4 w-4 accent-[#334f3b]"
                />
                <span className="font-medium">{lead.company}</span>
                <span className="text-muted-foreground">{lead.name} · {lead.email}</span>
              </label>
            ))}
            {leads.length === 0 && <p className="px-3 py-6 text-[13px] text-muted-foreground">No eligible recipients yet.</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => update('leadIds', leads.map((lead) => lead.id))}>Select all</Button>
            <Button size="sm" onClick={() => update('leadIds', [])}>Clear</Button>
          </div>
        </section>

        {error && <p className="text-[13px] text-destructive">{error}</p>}
        {notice && <p className="text-[13px] text-success">{notice}</p>}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { persist(); setNotice('Draft saved in this browser'); }}><Save size={15} /> Save draft</Button>
          <Button variant="primary" onClick={next}>Continue to preview</Button>
        </div>
      </div>

      <aside className="surface h-fit px-5 py-5">
        <div className="eyebrow">Template guidance</div>
        <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
          {TEMPLATE_GUIDANCE.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="eyebrow mt-6">Before sending</div>
        <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
          <li>Start with a small sample (2–5 recipients) and an internal test address.</li>
          <li>Each recipient gets one individual message. Addresses are never shared.</li>
          <li>Unresolved personalization placeholders block sending during preview.</li>
          <li>Every email includes a one-click unsubscribe link.</li>
          <li>Open tracking is optional and reported as approximate only.</li>
          <li>Campaign sending is disabled until ALLOW_SENDING=true is set deliberately.</li>
        </ul>
      </aside>
    </div>
  );
}
