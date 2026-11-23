import ExcelJS from 'exceljs';
import type { ColumnMapping, Lead, LeadStatus } from './types';
import { newId } from './id';
import { isEmail, normalizeEmail, splitEmails } from './utils';

export interface RawRow {
  sourceRow: number;
  cells: Record<string, unknown>;
}

export interface ParsedWorkbook {
  headers: string[];
  rows: RawRow[];
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isNaN(value)) return '';
  if (typeof value === 'string' && value.trim().toLowerCase() === 'nan') return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const candidate = value as { text?: unknown; richText?: Array<{ text: string }>; hyperlink?: string };
    if (typeof candidate.text === 'string') return candidate.text;
    if (Array.isArray(candidate.richText)) return candidate.richText.map((part) => part.text).join('');
    if (typeof candidate.hyperlink === 'string') return candidate.hyperlink;
    return '';
  }
  return String(value).replace(/\u00a0/g, ' ').trim();
}

export async function parseWorkbook(buffer: Uint8Array): Promise<ParsedWorkbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(buffer) as unknown as Parameters<typeof workbook.xlsx.load>[0]);

  const sheet =
    workbook.worksheets.find((worksheet) => worksheet.rowCount > 0) ?? workbook.worksheets[0];
  if (!sheet) throw new Error('The uploaded workbook has no worksheets');

  let headerRowIndex = -1;
  const scanLimit = Math.min(sheet.rowCount, 12);
  for (let index = 1; index <= scanLimit; index += 1) {
    const values = sheet.getRow(index).values as unknown[];
    if (values.some((value) => /e-?mail/i.test(cellText(value)))) {
      headerRowIndex = index;
      break;
    }
  }
  if (headerRowIndex < 0) throw new Error('No header row containing an Email column was found');

  const headerRow = sheet.getRow(headerRowIndex);
  const headers: string[] = [];
  const headerIndexes: number[] = [];
  headerRow.eachCell((cell, columnNumber) => {
    const text = cellText(cell.value);
    if (text) {
      headers.push(text);
      headerIndexes.push(columnNumber);
    }
  });
  if (headers.length === 0) throw new Error('The header row is empty');

  const rows: RawRow[] = [];
  for (let rowIndex = headerRowIndex + 1; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    const cells: Record<string, unknown> = {};
    let hasValue = false;
    headers.forEach((header, offset) => {
      const value = cellText(row.getCell(headerIndexes[offset]).value);
      cells[header] = value;
      if (value) hasValue = true;
    });
    if (hasValue) rows.push({ sourceRow: rowIndex, cells });
  }

  return { headers, rows };
}

export function autoMapColumns(headers: string[]): ColumnMapping {
  const find = (pattern: RegExp, exclude?: RegExp): string => {
    const exact = headers.find((header) => pattern.test(header) && (!exclude || !exclude.test(header)));
    if (exact) return exact;
    return headers.find((header) => pattern.test(header) && (!exclude || !exclude.test(header))) ?? '';
  };
  return {
    name: find(/contact|person|^name$/i, /e-?mail/i),
    email: find(/e-?mail/i),
    company: find(/compan|organi[sz]ation|business|firm/i, /person/i)
  };
}

export function validateMapping(mapping: ColumnMapping, headers: string[]): string[] {
  const errors: string[] = [];
  (['name', 'email', 'company'] as const).forEach((field) => {
    const selected = mapping[field];
    if (!selected) errors.push(`Select a column for ${field}`);
    else if (!headers.includes(selected)) errors.push(`Mapped column for ${field} is not in the workbook`);
  });
  if (mapping.name && mapping.name === mapping.email) errors.push('Name and Email must be different columns');
  if (mapping.name && mapping.name === mapping.company) errors.push('Name and Company must be different columns');
  if (mapping.email && mapping.email === mapping.company) errors.push('Email and Company must be different columns');
  return errors;
}

export function buildLeads(rows: RawRow[], mapping: ColumnMapping, optOutEmails: string[]): Lead[] {
  const optOuts = new Set(optOutEmails.map(normalizeEmail));
  const seen = new Set<string>();

  return rows.map((row) => {
    const name = cellText(row.cells[mapping.name]);
    const company = cellText(row.cells[mapping.company]);
    const rawEmail = cellText(row.cells[mapping.email]);
    const parsed = splitEmails(rawEmail);
    const valid = parsed.filter(isEmail);
    const email = valid[0] ?? normalizeEmail(rawEmail);
    const additionalEmails = valid.slice(1);
    const issues: string[] = [];

    if (!rawEmail) issues.push('Missing email');
    else if (valid.length === 0) issues.push('Invalid email');
    if (valid.length > 1) issues.push(`${valid.length} emails found; only the first will be used`);
    if (!name) issues.push('Missing contact name');
    if (!company) issues.push('Missing company name');

    const allAddresses = [email, ...additionalEmails].map(normalizeEmail).filter(Boolean);
    const optedOut = allAddresses.some((address) => optOuts.has(address));
    const duplicate = allAddresses.some((address) => seen.has(address));

    allAddresses.forEach((address) => seen.add(address));

    let status: LeadStatus = 'valid';
    if (!email) status = 'missing';
    else if (valid.length === 0) status = 'invalid';
    else if (duplicate) status = 'duplicate';
    else if (optedOut) status = 'opted-out';

    if (!valid.length && issues.length === 0) issues.push('Invalid email');
    if (duplicate) issues.push('Duplicate email address');
    if (optedOut) issues.push('Previously opted out');

    return {
      id: newId('lead_'),
      sourceRow: row.sourceRow,
      name,
      email,
      additionalEmails,
      company,
      phone: cellText(row.cells['Phone']) || cellText(row.cells['Phone ']),
      location: cellText(row.cells['Company Location']),
      website: cellText(row.cells['Website']),
      status,
      issues,
      excluded: false,
      optedOut
    };
  });
}

export function leadCounts(leads: Lead[]) {
  return {
    total: leads.length,
    valid: leads.filter((lead) => lead.status === 'valid').length,
    invalid: leads.filter((lead) => lead.status === 'invalid' || lead.status === 'missing').length,
    duplicate: leads.filter((lead) => lead.status === 'duplicate').length,
    optedOut: leads.filter((lead) => lead.status === 'opted-out').length,
    excluded: leads.filter((lead) => lead.excluded).length
  };
}
