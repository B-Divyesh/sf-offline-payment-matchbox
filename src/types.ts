export type Invoice = {
  id: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  sourceRow: number;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  reference: string;
  currency: string;
  sourceRow: number;
};

export type Match = {
  id: string;
  invoiceId: string;
  transactionId: string;
  note: string;
  method: 'suggested' | 'manual';
  matchedAt: string;
};

export type Ledger = {
  invoices: Invoice[];
  transactions: Transaction[];
  matches: Match[];
  sourceFiles?: { kind: 'invoice' | 'transaction'; name: string; text: string; savedAt: string }[];
  updatedAt: string;
};

export type ImportKind = 'invoice' | 'transaction';
export type ParsedCsv = { headers: string[]; rows: Record<string, string>[] };

export type InvoiceMapping = {
  id: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: string;
  currency: string;
};

export type TransactionMapping = {
  date: string;
  amount: string;
  reference: string;
  currency: string;
};
