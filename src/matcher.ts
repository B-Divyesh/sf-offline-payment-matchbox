import type { Invoice, Ledger, Transaction } from './types';

export type Candidate = {
  transaction: Transaction;
  score: number;
  reasons: string[];
  ambiguous: boolean;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function dateDistance(from: string, to: string): number | null {
  if (!from || !to) return null;
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.round((end - start) / 86_400_000);
}

export function scorePair(invoice: Invoice, transaction: Transaction): Omit<Candidate, 'transaction' | 'ambiguous'> {
  let score = 0;
  const reasons: string[] = [];
  if (Math.abs(Math.abs(transaction.amount) - Math.abs(invoice.amount)) <= 0.01) {
    score += 60;
    reasons.push('same amount');
  } else return { score: 0, reasons: ['different amount'] };

  if (invoice.currency && transaction.currency) {
    if (invoice.currency !== transaction.currency) return { score: 0, reasons: ['different currency'] };
    score += 10;
    reasons.push(`same ${invoice.currency} currency`);
  }
  const reference = normalize(transaction.reference);
  const invoiceId = normalize(invoice.id);
  if (invoiceId.length >= 2 && reference.includes(invoiceId)) {
    score += 30;
    reasons.push('invoice number in reference');
  }
  const customerTokens = invoice.customer.toLowerCase().split(/\s+/).map(normalize).filter((token) => token.length >= 4);
  if (customerTokens.some((token) => reference.includes(token))) {
    score += 12;
    reasons.push('customer name in reference');
  }
  const days = dateDistance(invoice.date || invoice.dueDate, transaction.date);
  if (days !== null && days >= -2 && days <= 45) {
    score += 10;
    reasons.push('date is within 45 days');
  } else if (days !== null && days >= -7 && days <= 120) {
    score += 5;
    reasons.push('date is within 120 days');
  }
  return { score, reasons };
}

export function suggestionsFor(invoice: Invoice, ledger: Ledger): Candidate[] {
  const used = new Set(ledger.matches.map((match) => match.transactionId));
  const candidatesFor = (item: Invoice) => ledger.transactions
    .filter((transaction) => !used.has(transaction.id))
    .map((transaction) => ({ transaction, ...scorePair(item, transaction), ambiguous: false }))
    .filter((candidate) => candidate.score >= 60)
    .sort((a, b) => b.score - a.score || a.transaction.date.localeCompare(b.transaction.date));
  const candidates = candidatesFor(invoice);
  if (candidates.length > 1 && candidates[0] && candidates[1] && candidates[0].score - candidates[1].score <= 8) {
    candidates[0].ambiguous = true;
    candidates[1].ambiguous = true;
  }
  const top = candidates[0];
  if (top) {
    const matchedInvoices = new Set(ledger.matches.map((match) => match.invoiceId));
    const paymentCompetes = ledger.invoices
      .filter((other) => other.id !== invoice.id && !matchedInvoices.has(other.id))
      .some((other) => {
        const otherTop = candidatesFor(other)[0];
        return otherTop?.transaction.id === top.transaction.id && otherTop.score >= top.score - 8;
      });
    if (paymentCompetes) {
      top.ambiguous = true;
      top.reasons.push('payment also fits another open invoice');
    }
  }
  return candidates;
}

export function summarize(ledger: Ledger) {
  const matchedInvoiceIds = new Set(ledger.matches.map((match) => match.invoiceId));
  const matchedTransactionIds = new Set(ledger.matches.map((match) => match.transactionId));
  return {
    invoices: ledger.invoices.length,
    payments: ledger.transactions.length,
    matched: ledger.matches.length,
    open: ledger.invoices.filter((invoice) => !matchedInvoiceIds.has(invoice.id)).length,
    unused: ledger.transactions.filter((transaction) => !matchedTransactionIds.has(transaction.id)).length,
    matchedValue: ledger.matches.reduce((sum, match) => sum + (ledger.invoices.find((invoice) => invoice.id === match.invoiceId)?.amount ?? 0), 0),
  };
}
