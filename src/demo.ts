import type { Ledger } from './types';

export function sampleLedger(): Ledger {
  return {
    invoices: [
      { id: 'INV-104', customer: 'Northstar Studio', date: '2026-08-01', dueDate: '2026-08-15', amount: 850, currency: 'USD', sourceRow: 2 },
      { id: 'INV-105', customer: 'Atlas Works', date: '2026-08-03', dueDate: '2026-08-17', amount: 425.5, currency: 'USD', sourceRow: 3 },
      { id: 'INV-106', customer: 'Cedar & Finch', date: '2026-08-05', dueDate: '2026-08-19', amount: 1200, currency: 'USD', sourceRow: 4 },
    ],
    transactions: [
      { id: 'demo-payment-1', date: '2026-08-08', amount: 850, reference: 'Payment INV-104 Northstar', currency: 'USD', sourceRow: 2 },
      { id: 'demo-payment-2', date: '2026-08-11', amount: 425.5, reference: 'Transfer INV-105 Atlas', currency: 'USD', sourceRow: 3 },
      { id: 'demo-payment-3', date: '2026-08-12', amount: 1200, reference: 'Cedar invoice 106', currency: 'USD', sourceRow: 4 },
    ],
    matches: [
      { id: 'demo-match-1', invoiceId: 'INV-104', transactionId: 'demo-payment-1', method: 'suggested', note: '', matchedAt: '2026-08-12T09:00:00.000Z' },
    ],
    updatedAt: '2026-08-12T09:00:00.000Z',
  };
}
