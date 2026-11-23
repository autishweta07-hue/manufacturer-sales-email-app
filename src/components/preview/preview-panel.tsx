'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DRAFT_KEY, type CampaignDraft } from '@/components/compose/composer-form';

interface LeadOption { id: string; company: string; name: string; email: string }
interface Preview { subject: string; text: string; unresolved: string[]; attachmentName?: string }
interface AllPreview { leadId: string; company: string; subject: string; unresolved: string[]; attachmentName?: string }

export function PreviewPanel({ leads, sendingEnabled }: { leads: LeadOption[]; sendingEnabled: boolean }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const [leadId, setLeadId] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [allPreviews, setAllPreviews] = useState<AllPreview[] | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CampaignDraft;
      setDraft(parsed);
      setRecipientCount(parsed.leadIds.length);
      setLeadId(parsed.leadIds[0] ?? '');
    } catch {
      setError('Saved draft could not be read. Return to the composer.');
    }
  }, []);

  async function jsonPost(path: string, body: unknown) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function renderPreview() {
    if (!draft || !leadId) return;
    setBusy('preview'); setError(''); setMessage('');
    try {
      const data = await jsonPost('/api/preview', { ...draft, leadId });
      setPreview(data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Preview failed'); }
    finally { setBusy(''); }
  }

  async function renderAll() {
    if (!draft) return;
    setBusy('all'); setError(''); setMessage('');
    try {
      const data = await jsonPost('/api/preview/all', draft);
      setAllPreviews(data.previews);
    } catch (err) { setError(err instanceof Error ? err.message : 'Preview failed'); }
    finally { setBusy(''); }
  }

  async function sendTest() {
    if (!draft || !leadId) return;
    setBusy('test'); setError(''); setMessage('');
    try {
      const data = await jsonPost('/api/send-test', { ...draft, leadId, to: testEmail });
      setMessage(`Test email sent to ${data.to}. Provider id: ${data.messageId || 'not supplied'}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Test email failed'); }
    finally { setBusy(''); }
  }

  async function createCampaign() {
    if (!draft) return;
    setBusy('create'); setError(''); setMessage('');
    try {
      const data = await jsonPost('/api/campaigns', draft);
      setCampaignId(data.campaign.id);
      setConfirmToken(data.campaign.confirmToken);
      setRecipientCount(data.campaign.recipients.length);
      setMessage(`Campaign ${data.campaign.name} created with ${data.campaign.recipients.length} recipients. Review, then confirm below.`);
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create campaign'); }
    finally { setBusy(''); }
  }

  async function startCampaign() {
    if (!campaignId || !confirmed) return;
    setBusy('send'); setError(''); setMessage('');
    try {
      await jsonPost(`/api/campaigns/${campaignId}/send`, { confirm: true, confirmToken });
      router.push(`/campaigns/${campaignId}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not start campaign'); }
    finally { setBusy(''); }
  }

  if (!draft) {
    return (
      <div className="surface px-6 py-12 text-center">
        <p className="text-[15px] font-semibold">No draft found</p>
        <p className="muted mx-auto mt-2 max-w-md">Compose and save an email first, then return here to preview and test it.</p>
        <Link href="/compose" className="mt-4 inline-block"><Button variant="primary">Open composer</Button></Link>
      </div>
    );
  }

  const unresolved = preview?.unresolved ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <section className="surface px-5 py-5">
          <h2>Individual preview</h2>
          <p className="muted mt-1">Choose a recipient to see exactly what they will receive.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1">
              <Label htmlFor="preview-lead">Recipient</Label>
              <Select id="preview-lead" value={leadId} onChange={(event) => { setLeadId(event.target.value); setPreview(null); }}>
                <option value="">Select a recipient…</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>{lead.company} — {lead.email}</option>
                ))}
              </Select>
            </div>
            <Button onClick={renderPreview} disabled={!leadId || busy === 'preview'}><Eye size={15} /> Render preview</Button>
            <Button onClick={renderAll} disabled={busy === 'all'}>Preview all recipients</Button>
          </div>
          {preview && (
            <div className="mt-5 rounded-[9px] border border-border bg-surface-subtle p-4">
              <div className="eyebrow">Subject</div>
              <div className="mt-1 text-[15px] font-semibold">{preview.subject}</div>
              <div className="eyebrow mt-5">Message</div>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] leading-relaxed">{preview.text}</pre>
              {preview.attachmentName && (
                <div className="mt-4 rounded-[8px] border border-border bg-surface px-3 py-2.5">
                  <div className="flex items-center gap-2 text-[13px] font-medium">
                    <Paperclip size={15} /> PDF attachment: {preview.attachmentName}
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">Attached to the email as a PDF file, not an external link.</p>
                </div>
              )}
              {unresolved.length > 0 && (
                <div className="mt-4 rounded-[8px] border border-[#e6c9c4] bg-[#f8e8e6] px-3 py-2 text-[12px] text-[#8b332c]">
                  Unresolved placeholders: {unresolved.join(', ')}. Fix the template before sending.
                </div>
              )}
            </div>
          )}
          {allPreviews && (
            <div className="mt-5 max-h-96 overflow-y-auto rounded-[9px] border border-border">
              {allPreviews.map((item) => (
                <div key={item.leadId} className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 last:border-b-0">
                  <div>
                    <div className="text-[13px] font-medium">{item.company}</div>
                    <div className="text-[12px] text-muted-foreground">{item.subject}</div>
                    {item.attachmentName && <div className="text-[12px] text-muted-foreground">PDF attachment: {item.attachmentName}</div>}
                  </div>
                  {item.unresolved.length > 0 ? <Badge tone="destructive">Unresolved: {item.unresolved.join(', ')}</Badge> : <Badge tone="success">Ready</Badge>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface px-5 py-5">
          <h2>Test email</h2>
          <p className="muted mt-1">Sends a real message through the configured SMTP account. Test sends are not counted as campaign sends.</p>
          {!sendingEnabled && <p className="mt-3 text-[12px] text-[#8b332c]">Sending is disabled. Set ALLOW_SENDING=true only when you are ready to send.</p>}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1">
              <Label htmlFor="test-email">Internal test address</Label>
              <Input id="test-email" type="email" placeholder="you@company.example" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} />
            </div>
            <Button onClick={sendTest} disabled={!sendingEnabled || !testEmail || !leadId || busy === 'test'}>Send test email</Button>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="surface px-5 py-5">
          <div className="eyebrow">Final steps</div>
          <ol className="mt-3 space-y-3 text-[13px] text-muted-foreground">
            <li>1. Preview the message for at least one recipient.</li>
            <li>2. Send a test email and check links and personalisation.</li>
            <li>3. Create the campaign, then confirm explicitly to send.</li>
          </ol>
          <div className="mt-5 space-y-3">
            <Button variant="secondary" className="w-full" onClick={createCampaign} disabled={busy === 'create'}>Create campaign</Button>
            {campaignId && (
              <div className="rounded-[8px] border border-border bg-surface-subtle px-3 py-3 text-[12px]">
              <div className="font-medium">Campaign ready</div>
              <div className="tabular mt-1 text-muted-foreground">{campaignId}</div>
              <div className="mt-3 rounded-[6px] bg-[#f8e8e6] px-2.5 py-2 text-[12px] font-medium text-[#8b332c]">
                This campaign will email exactly {recipientCount} recipient{recipientCount === 1 ? '' : 's'}.
              </div>
              <label className="mt-3 flex items-start gap-2 text-[12px]">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#334f3b]" />
                I have reviewed the recipients and approve this real campaign send.
              </label>
                <Button variant="primary" className="mt-3 w-full" onClick={startCampaign} disabled={!sendingEnabled || !confirmed || busy === 'send'}>
                  <Send size={15} /> Confirm and send
                </Button>
              </div>
            )}
          </div>
        </div>
        {message && <div className="surface px-5 py-4 text-[13px] text-success">{message}</div>}
        {error && <div className="surface px-5 py-4 text-[13px] text-destructive">{error}</div>}
      </aside>
    </div>
  );
}
