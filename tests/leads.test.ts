import assert from 'node:assert/strict';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { autoMapColumns, buildLeads, leadCounts, parseWorkbook, validateMapping } from '../src/lib/leads';

async function workbookBytes(): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  sheet.addRow(['Company Name', 'Contact Person ', 'Email', 'Phone ', 'Company Location', 'Website']);
  sheet.addRow(['Acme', 'Ada Lovelace', 'ada@example.com', '111', 'London', 'https://acme.example']);
  sheet.addRow(['Beta', 'Grace Hopper', 'grace@example.com / other@example.com', '222', 'New York', 'https://beta.example']);
  sheet.addRow(['Gamma', 'Alan Turing', '', '333', 'Paris', '']);
  sheet.addRow(['Delta', 'Linus Torvalds', 'not-an-email', '444', 'Helsinki', '']);
  sheet.addRow(['Epsilon', 'Barbara Liskov', 'ADA@EXAMPLE.COM', '555', 'Boston', '']);
  sheet.addRow(['Zeta', 'Edsger Dijkstra', 'OPTED@example.com', '666', 'Rotterdam', '']);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

test('Excel parsing finds the header row and maps the supplied columns', async () => {
  const parsed = await parseWorkbook(await workbookBytes());
  assert.equal(parsed.headers[0], 'Company Name');
  assert.equal(parsed.rows.length, 6);
  const mapping = autoMapColumns(parsed.headers);
  assert.equal(mapping.company, 'Company Name');
  assert.equal(mapping.name, 'Contact Person');
  assert.equal(mapping.email, 'Email');
  assert.deepEqual(validateMapping(mapping, parsed.headers), []);
});

test('lead validation handles multi-email, missing, invalid, duplicate and opted-out rows', async () => {
  const parsed = await parseWorkbook(await workbookBytes());
  const leads = buildLeads(parsed.rows, autoMapColumns(parsed.headers), ['opted@example.com']);
  const counts = leadCounts(leads);

  assert.equal(counts.total, 6);
  assert.equal(counts.valid, 2);
  assert.equal(counts.invalid, 2);
  assert.equal(counts.duplicate, 1);
  assert.equal(counts.optedOut, 1);

  const multi = leads.find((lead) => lead.company === 'Beta');
  assert.equal(multi?.email, 'grace@example.com');
  assert.deepEqual(multi?.additionalEmails, ['other@example.com']);
  assert.ok(multi?.issues.some((issue) => issue.includes('only the first')));

  const optedOut = leads.find((lead) => lead.company === 'Zeta');
  assert.equal(optedOut?.optedOut, true);
  assert.equal(optedOut?.status, 'opted-out');
});
