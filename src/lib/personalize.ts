import type { Lead } from './types';

export const PERSONALIZATION_VARIABLES = ['{{Name}}', '{{Company_Name}}', '{{Email}}'] as const;

export interface PersonalizedText {
  value: string;
  unresolved: string[];
}

export function personalize(template: string, lead: Lead): PersonalizedText {
  const rawName = String(lead.name ?? '').trim();
  const rawCompany = String(lead.company ?? '').trim();
  const rawEmail = String(lead.email ?? '').trim();
  const values: Record<string, string> = {
    Name: rawName && rawName.toLowerCase() !== 'nan' ? rawName : 'there',
    Company_Name: rawCompany.toLowerCase() === 'nan' ? '' : rawCompany,
    Email: rawEmail.toLowerCase() === 'nan' ? '' : rawEmail
  };
  const unresolved: string[] = [];

  const value = String(template ?? '').replace(/\{\{\s*([A-Za-z_]+)\s*\}\}/g, (match, key: string) => {
    const replacement = values[key];
    if (replacement === undefined || !replacement.trim()) {
      unresolved.push(match.replace(/\s/g, ''));
      return match;
    }
    return replacement.trim();
  });

  const leftovers = value.match(/\{\{[^}]+\}\}/g) ?? [];
  leftovers.forEach((leftover) => {
    const normalised = leftover.replace(/\s/g, '');
    if (!unresolved.includes(normalised)) unresolved.push(normalised);
  });

  return { value, unresolved: Array.from(new Set(unresolved)) };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function textToHtmlParagraphs(value: string): string {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px 0;">${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
