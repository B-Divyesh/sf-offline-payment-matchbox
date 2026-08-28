import { isCalendarDate } from './dates';
import type { Invoice, Ledger, Match, Transaction } from './types';

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isSourceRow = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 2;
const isOptionalDate = (value: unknown): value is string => isString(value) && (!value || isCalendarDate(value));
const isTimestamp = (value: unknown): value is string => isString(value) && Number.isFinite(Date.parse(value));

function invalid(detail: string): never {
  throw new Error(`This backup is invalid: ${detail}. Your current workspace was not changed.`);
}

function isInvoice(value: unknown): value is Invoice {
  return isRecord(value)
    && isString(value.id) && value.id.trim().length > 0
    && isString(value.customer)
    && isOptionalDate(value.date)
    && isOptionalDate(value.dueDate)
    && isFiniteNumber(value.amount)
    && isString(value.currency)
    && isSourceRow(value.sourceRow);
}

function isTransaction(value: unknown): value is Transaction {
  return isRecord(value)
    && isString(value.id) && value.id.trim().length > 0
    && isString(value.date) && isCalendarDate(value.date)
    && isFiniteNumber(value.amount)
    && isString(value.reference)
    && isString(value.currency)
    && isSourceRow(value.sourceRow);
}

function isMatch(value: unknown): value is Match {
  return isRecord(value)
    && isString(value.id) && value.id.trim().length > 0
    && isString(value.invoiceId) && value.invoiceId.trim().length > 0
    && isString(value.transactionId) && value.transactionId.trim().length > 0
    && isString(value.note)
    && (value.method === 'suggested' || value.method === 'manual')
    && (value.method !== 'manual' || value.note.trim().length >= 3)
    && isTimestamp(value.matchedAt);
}

export function parseLedgerBackup(value: unknown): Ledger {
  if (!isRecord(value)) invalid('the top level must be a workspace object');
  if (!Array.isArray(value.invoices) || !Array.isArray(value.transactions) || !Array.isArray(value.matches)) {
    invalid('invoices, payments, and matches must all be lists');
  }
  value.invoices.forEach((invoice, index) => { if (!isInvoice(invoice)) invalid(`invoice ${index + 1} is not a complete valid invoice record`); });
  value.transactions.forEach((transaction, index) => { if (!isTransaction(transaction)) invalid(`payment ${index + 1} is not a complete valid payment record`); });
  value.matches.forEach((match, index) => { if (!isMatch(match)) invalid(`match ${index + 1} is not a complete valid match record`); });
  if (!isTimestamp(value.updatedAt)) invalid('updatedAt must be a valid timestamp');

  const invoices = value.invoices as Invoice[];
  const transactions = value.transactions as Transaction[];
  const matches = value.matches as Match[];
  if (new Set(invoices.map((invoice) => invoice.id)).size !== invoices.length) invalid('invoice numbers must be unique');
  if (new Set(transactions.map((transaction) => transaction.id)).size !== transactions.length) invalid('payment IDs must be unique');
  if (new Set(matches.map((match) => match.id)).size !== matches.length) invalid('match IDs must be unique');

  const invoiceIds = new Set(invoices.map((invoice) => invoice.id));
  const transactionIds = new Set(transactions.map((transaction) => transaction.id));
  if (matches.some((match) => !invoiceIds.has(match.invoiceId) || !transactionIds.has(match.transactionId))) {
    invalid('every match must refer to an invoice and payment in the backup');
  }
  if (new Set(matches.map((match) => match.invoiceId)).size !== matches.length
    || new Set(matches.map((match) => match.transactionId)).size !== matches.length) {
    invalid('an invoice or payment cannot appear in more than one match');
  }

  let sourceFiles: Ledger['sourceFiles'];
  if (value.sourceFiles !== undefined) {
    if (!Array.isArray(value.sourceFiles)) invalid('sourceFiles must be a list when present');
    const valid = value.sourceFiles.every((source) => isRecord(source)
      && (source.kind === 'invoice' || source.kind === 'transaction')
      && isString(source.name) && source.name.length > 0
      && isString(source.text)
      && isTimestamp(source.savedAt));
    if (!valid) invalid('a retained source file is not a complete valid record');
    sourceFiles = value.sourceFiles as NonNullable<Ledger['sourceFiles']>;
  }

  return { invoices, transactions, matches, ...(sourceFiles ? { sourceFiles } : {}), updatedAt: value.updatedAt as string };
}
