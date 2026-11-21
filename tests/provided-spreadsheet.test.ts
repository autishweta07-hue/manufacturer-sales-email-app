import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { autoMapColumns, buildLeads, leadCounts, parseWorkbook } from '../src/lib/leads';

test('the provided spreadsheet imports without modifying the source file', async () => {
  const file = path.resolve(process.cwd(), 'Manufacturers (1).xlsx');
  const before = await readFile(file);
  const parsed = await parseWorkbook(before);

  assert.equal(parsed.headers[0], 'Company Name');
  assert.equal(parsed.headers[2], 'Email');
  assert.equal(parsed.rows.length, 51);

  const leads = buildLeads(parsed.rows, autoMapColumns(parsed.headers), []);
  const counts = leadCounts(leads);
  assert.equal(counts.valid, 51);
  assert.equal(counts.invalid, 0);
  assert.equal(leads.filter((lead) => lead.additionalEmails.length > 0).length, 10);

  const after = await readFile(file);
  assert.equal(after.length, before.length);
  assert.deepEqual(after.subarray(0, 64), before.subarray(0, 64));
});
