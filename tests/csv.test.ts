import { describe, expect, it } from 'vitest';
import { invoicesFromCsv, parseAmount, parseCsv, suggestInvoiceMapping, suggestTransactionMapping, transactionsFromCsv } from '../src/csv';

describe('CSV imports', () => {
  it('parses quoted fields and common invoice headings', () => {
    const csv = parseCsv('Invoice Number,Customer,Invoice Date,Amount,Currency\nINV-7,"Acme, Ltd",28/08/2026,"€1.250,50",EUR');
    const rows = invoicesFromCsv(csv, suggestInvoiceMapping(csv.headers));
    expect(rows[0]).toMatchObject({ id: 'INV-7', customer: 'Acme, Ltd', date: '2026-08-28', amount: 1250.5, currency: 'EUR' });
  });

  it('parses negative and thousands-formatted amounts', () => {
    expect(parseAmount('(1,234.50)')).toBe(-1234.5);
    expect(parseAmount('1.234,50 €')).toBe(1234.5);
  });

  it('imports a payment export with a stable local id', () => {
    const csv = parseCsv('Posted Date,Credit,Narration\n2026-08-09,850.00,INV-104 transfer');
    const mapping = suggestTransactionMapping(csv.headers);
    expect(transactionsFromCsv(csv, mapping)[0]).toMatchObject({ date: '2026-08-09', amount: 850, reference: 'INV-104 transfer' });
  });

  it('rejects duplicate invoice numbers', () => {
    const csv = parseCsv('id,amount\nINV-1,10\nINV-1,10');
    expect(() => invoicesFromCsv(csv, suggestInvoiceMapping(csv.headers))).toThrow(/appears more than once/);
  });

  it('rejects ISO-shaped payment dates that are not real calendar dates with the source row', () => {
    const csv = parseCsv('date,amount,description\n2026-99-99,100,test');
    expect(() => transactionsFromCsv(csv, suggestTransactionMapping(csv.headers))).toThrow('Payment row 2 needs a valid date and amount.');
  });

  it('rejects impossible optional invoice dates instead of silently dropping them', () => {
    const csv = parseCsv('invoice_id,invoice_date,amount\nINV-9,2026-02-30,100');
    expect(() => invoicesFromCsv(csv, suggestInvoiceMapping(csv.headers))).toThrow('Invoice row 2 needs a valid invoice date.');
  });
});
