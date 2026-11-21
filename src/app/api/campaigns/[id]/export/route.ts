import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import { requireAppAuth } from '@/lib/auth';
import { metricsFor } from '@/lib/events';
import { readState } from '@/lib/store';

export const runtime = 'nodejs';

function displayMetric(label: string, metric: { supported: boolean; value?: number }): [string, string, string] {
  return metric.supported ? [label, String(metric.value ?? 0), 'Measured'] : [label, 'Not available', 'Unsupported or not configured'];
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = requireAppAuth(request);
  if (authError) return authError;
  const { id } = await context.params;
  const state = await readState();
  const campaign = state.campaigns.find((entry) => entry.id === id);
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  const config = {
    webhooks: Boolean(process.env.WEBHOOK_SECRET),
    openTracking: process.env.OPEN_TRACKING_ENABLED === 'true',
    downloadable: campaign.deckMode === 'file'
  };
  const metrics = metricsFor(campaign, config);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Manufacturer Sales Email App';
  workbook.created = new Date();

  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 28 },
    { header: 'Value', key: 'value', width: 18 },
    { header: 'Basis', key: 'basis', width: 32 }
  ];
  const summaryRows: Array<[string, string, string]> = [
    ['Campaign', campaign.name, 'Recorded'],
    ['Created', campaign.createdAt, 'Recorded'],
    ['Status', campaign.status, 'Recorded'],
    ['Recipients selected', String(metrics.recipients), 'Recorded'],
    ['Emails sent', String(metrics.sent), 'Recorded'],
    ['Send failures', String(metrics.failed), 'Recorded'],
    ...[
      displayMetric('Delivered', metrics.delivered),
      displayMetric('Bounced', metrics.bounced),
      displayMetric('Opens (unique)', metrics.opened),
      displayMetric('Deck clicks (unique)', metrics.clicked),
      displayMetric('Deck downloads (unique)', metrics.downloaded)
    ],
    ['Unsubscribed', String(metrics.unsubscribed), 'Recorded'],
    ['Interested', String(metrics.interested), 'Recorded'],
    ['Not interested', String(metrics.notInterested), 'Recorded'],
    ['Request a call', String(metrics.requestCall), 'Recorded'],
    ['Pending follow-ups', String(metrics.pendingFollowUps), 'Recorded']
  ];
  summaryRows.forEach((row) => summary.addRow({ metric: row[0], value: row[1], basis: row[2] }));
  summary.getRow(1).font = { bold: true };

  const recipients = workbook.addWorksheet('Recipients');
  recipients.columns = [
    { header: 'Company', key: 'company', width: 32 },
    { header: 'Contact', key: 'name', width: 24 },
    { header: 'Email', key: 'email', width: 38 },
    { header: 'Send status', key: 'sendStatus', width: 16 },
    { header: 'Attempts', key: 'attempts', width: 10 },
    { header: 'Sent at', key: 'sentAt', width: 24 },
    { header: 'Provider message id', key: 'messageId', width: 32 },
    { header: 'Response', key: 'response', width: 18 },
    { header: 'Responded at', key: 'respondedAt', width: 24 },
    { header: 'Follow-up', key: 'followUp', width: 14 },
    { header: 'Follow-up note', key: 'note', width: 28 },
    { header: 'Opened', key: 'opened', width: 10 },
    { header: 'Deck clicked', key: 'clicked', width: 12 },
    { header: 'Deck downloaded', key: 'downloaded', width: 16 },
    { header: 'Unsubscribed', key: 'unsubscribed', width: 14 },
    { header: 'Send error', key: 'error', width: 32 }
  ];
  campaign.recipients.forEach((recipient) => {
    const has = (type: string) => campaign.events.some((event) => event.leadId === recipient.leadId && event.type === type);
    recipients.addRow({
      company: recipient.lead.company,
      name: recipient.lead.name,
      email: recipient.lead.email,
      sendStatus: recipient.sendStatus,
      attempts: recipient.attempts,
      sentAt: recipient.sentAt ?? '',
      messageId: recipient.providerMessageId ?? '',
      response: recipient.response ?? '',
      respondedAt: recipient.respondedAt ?? '',
      followUp: recipient.followUp,
      note: recipient.followUpNote ?? '',
      opened: has('opened') ? 'yes' : 'no',
      clicked: has('clicked') ? 'yes' : 'no',
      downloaded: has('downloaded') ? 'yes' : 'no',
      unsubscribed: has('unsubscribed') ? 'yes' : 'no',
      error: recipient.error ?? ''
    });
  });
  recipients.getRow(1).font = { bold: true };

  const events = workbook.addWorksheet('Events');
  events.columns = [
    { header: 'Timestamp', key: 'at', width: 24 },
    { header: 'Event', key: 'type', width: 18 },
    { header: 'Email', key: 'email', width: 38 },
    { header: 'Company', key: 'company', width: 30 },
    { header: 'Source', key: 'source', width: 16 },
    { header: 'Detail', key: 'detail', width: 28 }
  ];
  campaign.events.forEach((event) => {
    const recipient = campaign.recipients.find((entry) => entry.leadId === event.leadId);
    events.addRow({
      at: event.at,
      type: event.type,
      email: recipient?.lead.email ?? '',
      company: recipient?.lead.company ?? '',
      source: event.source ?? '',
      detail: event.detail ?? ''
    });
  });
  events.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(Buffer.from(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${campaign.id}-results.xlsx"`,
      'Cache-Control': 'no-store'
    }
  });
}
