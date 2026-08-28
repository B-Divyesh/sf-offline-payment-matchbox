import { describe, expect, it } from 'vitest';
import { parseLedgerBackup } from '../src/backup';

const valid = {
  invoices: [{ id: 'INV-1', customer: 'Acme', date: '2026-08-01', dueDate: '', amount: 100, currency: 'USD', sourceRow: 2 }],
  transactions: [{ id: 'txn-1', date: '2026-08-08', amount: 100, reference: 'INV-1', currency: 'USD', sourceRow: 2 }],
  matches: [{ id: 'match-1', invoiceId: 'INV-1', transactionId: 'txn-1', note: '', method: 'suggested', matchedAt: '2026-08-28T10:00:00.000Z' }],
  updatedAt: '2026-08-28T10:00:00.000Z',
};

describe('workspace backup validation', () => {
  it('accepts a complete exported workspace', () => {
    expect(parseLedgerBackup(valid)).toEqual(valid);
  });

  it('rejects null records before they can replace or render the workspace', () => {
    expect(() => parseLedgerBackup({ ...valid, invoices: [null] })).toThrow(/invoice 1.*current workspace was not changed/i);
  });

  it('rejects broken match references and duplicate payment use', () => {
    expect(() => parseLedgerBackup({ ...valid, matches: [{ ...valid.matches[0], transactionId: 'missing' }] })).toThrow(/refer to an invoice and payment/i);
    expect(() => parseLedgerBackup({ ...valid, matches: [valid.matches[0], { ...valid.matches[0], id: 'match-2', invoiceId: 'INV-2' }] })).toThrow(/refer to an invoice and payment/i);
  });

  it('rejects structurally valid records with impossible dates', () => {
    expect(() => parseLedgerBackup({ ...valid, transactions: [{ ...valid.transactions[0], date: '2026-99-99' }] })).toThrow(/payment 1/i);
  });
});
