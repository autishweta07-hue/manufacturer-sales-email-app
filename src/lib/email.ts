import nodemailer, { type Transporter } from 'nodemailer';
import type { Campaign, Lead } from './types';
import { escapeHtml, personalize, textToHtmlParagraphs } from './personalize';
import { createToken } from './tokens';

export interface RenderedEmail {
  subject: string;
  body: string;
  text: string;
  html: string;
  unresolved: string[];
  unsubscribeUrl: string;
}

export function linkFor(token: string, endpoint: string, appUrl: string, query = ''): string {
  return `${appUrl.replace(/\/$/, '')}/api/track/${endpoint}/${token}${query}`;
}

export function appUrl(): string {
  return (process.env.PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function renderEmail(campaign: Campaign, lead: Lead, token: string): RenderedEmail {
  const subject = personalize(campaign.subject, lead);
  const body = personalize(campaign.body, lead);
  const base = appUrl();
  const unsubscribeUrl = linkFor(token, 'unsubscribe', base);
  const openUrl = linkFor(token, 'open', base);
  const deckUrl =
    campaign.deckMode === 'file'
      ? `${base}/api/track/download/${token}`
      : campaign.deckMode === 'link'
        ? linkFor(token, 'click', base)
        : '';
  const responseUrl = (response: string) => linkFor(token, 'respond', base, `?r=${response}`);
  const openTracking = process.env.OPEN_TRACKING_ENABLED === 'true';
  const unresolved = Array.from(new Set([...subject.unresolved, ...body.unresolved]));

  const text = [
    subject.value,
    '',
    body.value,
    deckUrl ? `\nSales deck: ${deckUrl}` : '',
    '\nHow would you like to proceed?',
    `Interested: ${responseUrl('interested')}`,
    `Not interested: ${responseUrl('not_interested')}`,
    `Request a call: ${responseUrl('request_call')}`,
    `\nUnsubscribe: ${unsubscribeUrl}`
  ]
    .filter(Boolean)
    .join('\n');

  const ctaButton = (label: string, response: string, background: string) =>
    `<a href="${escapeHtml(responseUrl(response))}" style="display:inline-block;padding:11px 18px;margin:0 8px 8px 0;border-radius:8px;background:${background};color:#17200b;text-decoration:none;font-weight:600;font-size:13px;">${label}</a>`;

  const deckBlock = deckUrl
    ? `<p style="margin:24px 0 8px 0;"><a href="${escapeHtml(deckUrl)}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#171a17;color:#ffffff;text-decoration:none;font-weight:600;font-size:13px;">View the sales deck</a></p>`
    : '';

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#f7f7f3;font-family:Inter,Arial,sans-serif;color:#171a17;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e4e7df;border-radius:12px;width:100%;">
      <tr><td style="padding:28px 32px 0 32px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#737a72;">Manufacturer outreach</td></tr>
      <tr><td style="padding:16px 32px 0 32px;font-size:22px;font-weight:600;letter-spacing:-0.02em;">${escapeHtml(subject.value)}</td></tr>
      <tr><td style="padding:20px 32px 0 32px;font-size:14px;line-height:1.6;color:#171a17;">${textToHtmlParagraphs(body.value)}</td></tr>
      <tr><td style="padding:0 32px 8px 32px;">${deckBlock}</td></tr>
      <tr><td style="padding:20px 32px 8px 32px;border-top:1px solid #e4e7df;font-size:13px;color:#737a72;">What would you like to do next?</td></tr>
      <tr><td style="padding:0 32px 24px 32px;">
        ${ctaButton('Interested', 'interested', '#b7e34a')}
        ${ctaButton('Not Interested', 'not_interested', '#e9ede3')}
        ${ctaButton('Request a Call', 'request_call', '#334f3b')}
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #e4e7df;font-size:12px;line-height:1.5;color:#737a72;">
        You are receiving this message because your contact details were supplied for this outreach campaign.
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#737a72;text-decoration:underline;">Unsubscribe</a> and we will not contact you again.
        ${openTracking ? '<br>Open tracking is used for approximate reporting only.' : ''}
      </td></tr>
    </table>
    ${openTracking ? `<img src="${escapeHtml(openUrl)}" width="1" height="1" alt="" style="display:none;">` : ''}
  </body>
</html>`;

  return { subject: subject.value, body: body.value, text, html, unresolved, unsubscribeUrl };
}

export function createTransporter(): Transporter {
  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error('SMTP_HOST is not configured. Set the SMTP settings in .env.local before sending email.');
  }
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be configured with an authorised mailbox.');
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_SECURE !== 'true' && port === 587,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000
  });
}

export async function deliverEmail(
  transporter: Transporter,
  rendered: RenderedEmail,
  to: string
): Promise<{ messageId: string; response: string }> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error('EMAIL_FROM is not configured');
  const result = await transporter.sendMail({
    from,
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    headers: {
      'List-Unsubscribe': `<${rendered.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  });
  return { messageId: String(result.messageId || ''), response: String(result.response || '') };
}

export function isTransientSmtpError(error: unknown): boolean {
  const code = (error as { code?: string | number })?.code;
  const response = String((error as { response?: unknown })?.response ?? '');
  if (typeof code === 'number' && code >= 400 && code < 500) return true;
  if (typeof code === 'string') {
    if (/^E(CONNRESET|CONNECTION|ENVELOPE|TIMEOUT|AI_AGAIN|NETWORK|STREAM|TLS)/i.test(code)) return true;
    if (/^[45]\d\d$/.test(code)) return code.startsWith('4');
  }
  return /^\s*4\d\d\b/.test(response);
}

export function campaignToken(campaignId: string, leadId: string): string {
  return createToken({ c: campaignId, l: leadId, p: 'recipient' });
}
