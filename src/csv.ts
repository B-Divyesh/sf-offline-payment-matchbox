import type { Invoice, InvoiceMapping, ParsedCsv, Transaction, TransactionMapping } from './types';
import { normalizedDate } from './dates';

export function parseCsv(text: string): ParsedCsv {
  const source = text.replace(/^\uFEFF/, '');
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field.trim());
      field = '';
    } else if (char === '\n') {
      row.push(field.trim());
      if (row.some(Boolean)) records.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (quoted) throw new Error('A quoted field is not closed. Check the last few rows and try again.');
  row.push(field.trim());
  if (row.some(Boolean)) records.push(row);
  if (records.length < 2) throw new Error('This CSV needs a header row and at least one data row.');

  const headers = records[0]?.map((header, index) => header || `Column ${index + 1}`) ?? [];
  if (new Set(headers.map(normalizeHeader)).size !== headers.length) {
    throw new Error('Two columns have the same name. Rename one of them and try again.');
  }
  const rows = records.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
  return { headers, rows };
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findHeader(headers: string[], names: string[]): string {
  const normalized = names.map(normalizeHeader);
  return headers.find((header) => normalized.includes(normalizeHeader(header))) ?? '';
}

export function suggestInvoiceMapping(headers: string[]): InvoiceMapping {
  return {
    id: findHeader(headers, ['invoice id', 'invoice number', 'invoice no', 'number', 'reference', 'id']),
    customer: findHeader(headers, ['customer', 'client', 'customer name', 'client name', 'name']),
    date: findHeader(headers, ['invoice date', 'issued date', 'issue date', 'date']),
    dueDate: findHeader(headers, ['due date', 'payment due', 'due']),
    amount: findHeader(headers, ['amount', 'total', 'amount due', 'invoice total', 'balance']),
    currency: findHeader(headers, ['currency', 'currency code', 'ccy']),
  };
}

export function suggestTransactionMapping(headers: string[]): TransactionMapping {
  return {
    date: findHeader(headers, ['date', 'transaction date', 'posted date', 'value date']),
    amount: findHeader(headers, ['amount', 'credit', 'value', 'paid amount', 'net']),
    reference: findHeader(headers, ['reference', 'description', 'memo', 'narration', 'details', 'name']),
    currency: findHeader(headers, ['currency', 'currency code', 'ccy']),
  };
}

export function parseAmount(value: string): number {
  let clean = value.trim().replace(/\s/g, '');
  const negative = /^\(.*\)$/.test(clean) || clean.endsWith('-');
  clean = clean.replace(/[()-]/g, '').replace(/[^0-9,.]/g, '');
  if (!clean) return Number.NaN;
  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');
  if (lastComma > lastDot) clean = clean.replace(/\./g, '').replace(',', '.');
  else clean = clean.replace(/,/g, '');
  const amount = Number(clean);
  return negative ? -amount : amount;
}

export function invoicesFromCsv(csv: ParsedCsv, mapping: InvoiceMapping): Invoice[] {
  if (!mapping.id || !mapping.amount) throw new Error('Choose columns for invoice number and amount.');
  const invoices = csv.rows.map((row, index) => ({
    id: row[mapping.id]?.trim() ?? '',
    customer: mapping.customer ? row[mapping.customer]?.trim() ?? '' : '',
    date: mapping.date ? normalizedDate(row[mapping.date] ?? '') : '',
    dueDate: mapping.dueDate ? normalizedDate(row[mapping.dueDate] ?? '') : '',
    amount: parseAmount(row[mapping.amount] ?? ''),
    currency: mapping.currency ? (row[mapping.currency]?.trim().toUpperCase() || '') : '',
    sourceRow: index + 2,
  }));
  const bad = invoices.find((invoice) => !invoice.id || !Number.isFinite(invoice.amount));
  if (bad) throw new Error(`Invoice row ${bad.sourceRow} needs a number and a valid amount.`);
  const invalidInvoiceDate = mapping.date && invoices.find((invoice, index) => Boolean(csv.rows[index]?.[mapping.date]?.trim()) && !invoice.date);
  if (invalidInvoiceDate) throw new Error(`Invoice row ${invalidInvoiceDate.sourceRow} needs a valid invoice date.`);
  const invalidDueDate = mapping.dueDate && invoices.find((invoice, index) => Boolean(csv.rows[index]?.[mapping.dueDate]?.trim()) && !invoice.dueDate);
  if (invalidDueDate) throw new Error(`Invoice row ${invalidDueDate.sourceRow} needs a valid due date.`);
  const duplicate = invoices.find((invoice, index) => invoices.findIndex((other) => other.id === invoice.id) !== index);
  if (duplicate) throw new Error(`Invoice number “${duplicate.id}” appears more than once.`);
  return invoices;
}

export function transactionsFromCsv(csv: ParsedCsv, mapping: TransactionMapping): Transaction[] {
  if (!mapping.date || !mapping.amount) throw new Error('Choose columns for transaction date and amount.');
  const transactions = csv.rows.map((row, index) => ({
    id: `txn-${index + 2}-${simpleHash(Object.values(row).join('|'))}`,
    date: normalizedDate(row[mapping.date] ?? ''),
    amount: parseAmount(row[mapping.amount] ?? ''),
    reference: mapping.reference ? row[mapping.reference]?.trim() ?? '' : '',
    currency: mapping.currency ? (row[mapping.currency]?.trim().toUpperCase() || '') : '',
    sourceRow: index + 2,
  }));
  const bad = transactions.find((transaction) => !transaction.date || !Number.isFinite(transaction.amount));
  if (bad) throw new Error(`Payment row ${bad.sourceRow} needs a valid date and amount.`);
  return transactions;
}

function simpleHash(value: string): string {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash.toString(36);
}

export function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
