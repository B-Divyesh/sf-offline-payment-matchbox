import { describe, expect, it } from 'vitest';
import { scorePair, suggestionsFor } from '../src/matcher';
import type { Invoice, Ledger, Transaction } from '../src/types';

const invoice: Invoice = { id: 'INV-104', customer: 'Northstar Studio', date: '2026-08-01', dueDate: '', amount: 850, currency: 'USD', sourceRow: 2 };
const payment = (id: string, reference: string, amount = 850): Transaction => ({ id, date: '2026-08-08', amount, reference, currency: 'USD', sourceRow: 2 });

describe('deterministic matching', () => {
  it('ranks amount, reference, currency, customer, and date evidence', () => {
    const result = scorePair(invoice, payment('a', 'Payment INV-104 Northstar Studio'));
    expect(result.score).toBe(122);
    expect(result.reasons).toContain('invoice number in reference');
  });

  it('does not suggest different amounts or currencies', () => {
    expect(scorePair(invoice, payment('a', 'INV-104', 851)).score).toBe(0);
    expect(scorePair(invoice, { ...payment('b', 'INV-104'), currency: 'EUR' }).score).toBe(0);
  });

  it('flags close-scoring alternatives as ambiguous', () => {
    const ledger: Ledger = { invoices: [invoice], transactions: [payment('a', 'wire'), payment('b', 'transfer')], matches: [], updatedAt: '' };
    const suggestions = suggestionsFor(invoice, ledger);
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0]?.ambiguous).toBe(true);
    expect(suggestions[1]?.ambiguous).toBe(true);
  });

  it('excludes a payment already used by another match', () => {
    const ledger: Ledger = { invoices: [invoice], transactions: [payment('a', 'INV-104')], matches: [{ id: 'm', invoiceId: 'other', transactionId: 'a', method: 'manual', note: 'Checked', matchedAt: '' }], updatedAt: '' };
    expect(suggestionsFor(invoice, ledger)).toEqual([]);
  });

  it('flags one payment competing for two equally plausible invoices as ambiguous in both directions', () => {
    const other = { ...invoice, id: 'INV-105', customer: 'Atlas Works' };
    const sharedPayment = payment('shared', 'Payment received');
    const ledger: Ledger = { invoices: [invoice, other], transactions: [sharedPayment], matches: [], updatedAt: '' };

    expect(suggestionsFor(invoice, ledger)[0]).toMatchObject({ transaction: sharedPayment, ambiguous: true, reasons: expect.arrayContaining(['payment also fits another open invoice']) });
    expect(suggestionsFor(other, ledger)[0]).toMatchObject({ transaction: sharedPayment, ambiguous: true });
  });

  it('keeps a clearly referenced invoice suggestion unambiguous despite another equal-amount invoice', () => {
    const other = { ...invoice, id: 'INV-105', customer: 'Atlas Works' };
    const referenced = payment('shared', 'Payment INV-104 Northstar Studio');
    const ledger: Ledger = { invoices: [invoice, other], transactions: [referenced], matches: [], updatedAt: '' };

    expect(suggestionsFor(invoice, ledger)[0]?.ambiguous).toBe(false);
    expect(suggestionsFor(other, ledger)[0]).toMatchObject({ ambiguous: true, reasons: expect.arrayContaining(['payment also fits another open invoice']) });
  });
});
