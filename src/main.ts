import './style.css';
import trayArtwork from './assets/matchbox-trays.webp';
import { parseLedgerBackup } from './backup';
import { escapeCsv, invoicesFromCsv, parseCsv, suggestInvoiceMapping, suggestTransactionMapping, transactionsFromCsv } from './csv';
import { isCalendarDate } from './dates';
import { clearLedger, emptyLedger, loadLedger, saveLedger } from './db';
import { sampleLedger } from './demo';
import { checkoutUrl, configureLicense, initLicense, restoreLicense, scopedStorageKey, subscribeLicense, type LicenseState } from './license';
import { suggestionsFor, summarize } from './matcher';
import type { ImportKind, InvoiceMapping, Ledger, Match, ParsedCsv, TransactionMapping } from './types';

type PendingImport = {
  kind: ImportKind;
  fileName: string;
  text: string;
  csv: ParsedCsv;
  mapping: InvoiceMapping | TransactionMapping;
};

const app = document.querySelector<HTMLDivElement>('#app')!;
const isDemo = location.pathname === '/demo' || location.pathname === '/demo/' || new URLSearchParams(location.search).get('demo') === '1';
const mappingKey = (kind: ImportKind, headers: string[]) => scopedStorageKey(`matchbox:mapping:${kind}:${headers.join('|')}`);

let ledger: Ledger = emptyLedger();
let pending: PendingImport | null = null;
let license: LicenseState = { token: '', unlocked: false, checking: false, notice: '' };
let manualInvoiceId = '';
let statusMessage = 'Loading your local workspace…';
let showAllOpen = false;
let started = false;
let licenseDialogOpen = false;

document.title = isDemo ? 'Demo — Matchbox Ledger' : 'Matchbox Ledger — match payments to invoices';
document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', isDemo ? 'https://offline-payment-matchbox.sociobot.in/demo/' : 'https://offline-payment-matchbox.sociobot.in/');
if (isDemo) {
  const setMeta = (selector: string, content: string) => document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
  setMeta('meta[name="description"]', 'Try Matchbox Ledger with a separate sample ledger for three freelancer invoices.');
  setMeta('meta[property="og:title"]', 'Demo — Matchbox Ledger');
  setMeta('meta[property="og:description"]', 'Try payment matching with a separate sample ledger.');
  setMeta('meta[property="og:url"]', 'https://offline-payment-matchbox.sociobot.in/demo/');
  setMeta('meta[name="twitter:title"]', 'Demo — Matchbox Ledger');
  setMeta('meta[name="twitter:description"]', 'Try payment matching with a separate sample ledger.');
}
configureLicense(isDemo);

const money = (amount: number, currency = '') => {
  try {
    return new Intl.NumberFormat(undefined, { style: currency ? 'currency' : 'decimal', currency: currency || undefined, maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`.trim();
  }
};
const dateLabel = (value: string) => value && isCalendarDate(value) ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date';
const html = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);

function icon(name: 'lock' | 'file' | 'link' | 'check' | 'warning' | 'download' | 'spark'): string {
  const paths = {
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    warning: '<path d="M12 3 2.7 20h18.6z"/><path d="M12 9v4M12 17h.01"/>',
    download: '<path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/>',
    spark: '<path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4zM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7z"/>',
  };
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function render(): void {
  const stats = summarize(ledger);
  const hasFiles = ledger.invoices.length > 0 || ledger.transactions.length > 0;
  const openInvoices = ledger.invoices.filter((invoice) => !ledger.matches.some((match) => match.invoiceId === invoice.id));
  const displayInvoices = showAllOpen ? openInvoices : openInvoices.slice(0, 8);
  app.innerHTML = `
    ${isDemo ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved to your workspace</strong><span><button type="button" data-action="reset-demo">Reset demo</button><button type="button" data-action="start-real">Start for real</button></span></aside>` : ''}
    <header class="site-header">
      <a class="brand" href="/" aria-label="Matchbox Ledger home"><span class="brand-mark" aria-hidden="true"><i></i><i></i></span><span>Matchbox Ledger</span></a>
      <nav aria-label="Site navigation">
        <a href="/?demo=1">Demo</a>
        <a href="/#workspace">Workspace</a>
        <a href="/privacy/">Privacy</a>
      </nav>
    </header>
    <main id="main">
      <section class="hero ${hasFiles ? 'hero-compact' : ''}">
        <div class="hero-copy">
          <p class="eyebrow">${isDemo ? 'Sample payment matches' : 'Match downloaded payments to invoices'}</p>
          <h1 tabindex="-1">${isDemo ? 'Review the sample payment matches' : 'Match payments to invoices from two CSVs'}</h1>
          <p class="lede">${isDemo ? 'Explore three freelancer invoices and their downloaded payments. Demo changes stay separate from your workspace.' : 'For freelancers who reconcile invoices in spreadsheets or offline tools.'}</p>
          ${isDemo ? demoPreview() : `<div class="hero-actions"><a class="primary-button" href="/?demo=1">Try it with sample data</a><span>Opens a separate ledger with three invoices.</span><a class="secondary-button" href="#workspace">Choose your invoice CSV</a></div><ul class="plain-facts"><li>${icon('check')} Works offline after the first visit</li><li>${icon('lock')} Files stay on this device</li><li>${icon('spark')} Free matcher · Plus costs $19 once</li></ul>`}
          <div class="privacy-stamp">${icon('lock')} <span><strong>Your CSV data stays in this browser</strong><small>Source CSV text is saved only when you choose it.</small></span></div>
        </div>
        ${hasFiles ? '' : `<figure class="hero-art"><img src="${trayArtwork}" width="1200" height="800" alt="Two porcelain sorting trays connected by one cobalt matchstick" fetchpriority="high" decoding="async"><figcaption>Invoice and payment rows appear side by side.</figcaption></figure>`}
      </section>

      <section class="how-section" aria-labelledby="how-title">
        <div class="section-heading"><div><p class="step-label">Three steps</p><h2 id="how-title">How it works</h2></div></div>
        <ol class="how-list"><li><strong>Import both CSVs</strong><span>Choose invoice and payment columns before anything is saved.</span></li><li><strong>Review each suggestion</strong><span>Confirm clear pairs. Add a note to every manual match.</span></li><li><strong>Export the record</strong><span>Download matched, open, and unused rows in one report.</span></li></ol>
      </section>

      <section class="workbench" id="workspace" aria-labelledby="workspace-title">
        <div class="section-heading">
          <div><p class="step-label">01 · Prepare</p><h2 id="workspace-title" tabindex="-1">Import your invoice and payment CSVs</h2></div>
          <p>CSV only · nothing leaves this device</p>
        </div>
        <div class="import-grid">
          ${importTray('invoice', ledger.invoices.length, 'Open invoices', 'Invoice number and amount are required', 'invoice_id,customer,invoice_date,amount,currency\nINV-104,Northstar Studio,2026-08-01,850.00,USD')}
          ${importTray('transaction', ledger.transactions.length, 'Bank or payment export', 'Date and amount are required', 'date,amount,description,currency\n2026-08-08,850.00,Payment INV-104 Northstar,USD')}
        </div>
        ${pending ? mappingPanel(pending) : ''}
      </section>

      ${hasFiles ? `<section class="ledger-section" aria-labelledby="match-title">
        <div class="section-heading">
          <div><p class="step-label">02 · Review</p><h2 id="match-title" tabindex="-1">Resolve the ledger</h2></div>
          <div class="button-row">${ledger.invoices.length && ledger.transactions.length ? '<button class="secondary-button" type="button" data-action="export-report">'+icon('download')+' Export current report</button>' : ''}${license.unlocked ? '<button class="secondary-button" type="button" data-action="batch-confirm">'+icon('spark')+' Confirm all strong matches</button>' : ''}</div>
        </div>
        <div class="tally" aria-label="Reconciliation summary">
          <div><strong>${stats.matched}</strong><span>matched</span></div>
          <div><strong>${stats.open}</strong><span>open invoices</span></div>
          <div><strong>${stats.unused}</strong><span>unused payments</span></div>
          <div><strong>${money(stats.matchedValue, ledger.invoices[0]?.currency ?? '')}</strong><span>resolved value</span></div>
        </div>
        ${ledger.invoices.length && ledger.transactions.length ? `<div class="suggestion-list">${displayInvoices.length ? displayInvoices.map(invoiceRow).join('') : '<div class="complete-state">'+icon('check')+'<div><h3>Every invoice has a match</h3><p>Review the confirmed record below, then export your report.</p></div></div>'}</div>` : missingFileState()}
        ${openInvoices.length > 8 && !showAllOpen ? `<button class="text-button show-all" type="button" data-action="show-all">Show all ${openInvoices.length} open invoices</button>` : ''}
      </section>` : ''}

      ${ledger.matches.length ? `<section class="confirmed-section" aria-labelledby="confirmed-title">
        <div class="section-heading"><div><p class="step-label">03 · Record</p><h2 id="confirmed-title">Confirmed matches</h2></div><button class="primary-button" type="button" data-action="export-report">${icon('download')} Export report CSV</button></div>
        <div class="table-scroll"><table><thead><tr><th>Invoice</th><th>Payment date</th><th class="numeric">Amount</th><th>How matched</th><th>Note</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${ledger.matches.map(matchRow).join('')}</tbody></table></div>
      </section>` : ''}

      <section class="data-section" id="your-data" aria-labelledby="data-title">
        <div class="section-heading"><div><p class="step-label">Local data controls</p><h2 id="data-title">Back up or clear your local workspace</h2></div></div>
        <div class="data-grid">
          <div><h3>Back up this workspace</h3><p>Export invoices, payments, matches, and notes as one JSON file. Import it later on this or another device.</p><div class="button-row"><button class="secondary-button" type="button" data-action="export-json">Export backup</button><label class="secondary-button file-button">Import backup<input id="backup-input" type="file" accept="application/json,.json"></label></div></div>
          <div><h3>Start a clean month</h3><p>Removing a workspace clears Matchbox data from this browser. Export a backup first if you may need it.</p><button class="danger-button" type="button" data-action="clear">Clear local workspace</button></div>
        </div>
      </section>

      <section class="plus-section" aria-labelledby="plus-title"><div><p class="step-label">Paid features</p><h2 id="plus-title">Matchbox Plus costs $19 once</h2><p>The free matcher includes manual review, reports, backups, and offline use. Plus confirms all clear strong suggestions together and remembers repeat column mappings.</p></div><button class="primary-button" type="button" data-action="open-license">View Plus features</button></section>
    </main>
    <footer><p>Match payments to invoices from two CSVs.</p><p><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><button class="link-button" type="button" data-action="open-license">View Plus features</button></p><p class="art-credit">Built by Param Factory · ${__RELEASE_LABEL__} · Still-life artwork generated for this product with the factory image model.</p></footer>
    <div class="network-pill ${navigator.onLine ? '' : 'is-offline'}" role="status"><span></span>${navigator.onLine ? 'Ready offline' : 'You are offline — matching still works'}</div>
    <div id="live-status" class="sr-only" aria-live="polite">${html(statusMessage)}</div>
    ${manualDialog()}
    ${licenseDialog()}
    <div class="toast" id="update-toast" hidden><span>An app update is ready.</span><button type="button" data-action="reload">Reload</button></div>`;
  if (licenseDialogOpen) {
    const dialog = document.querySelector<HTMLDialogElement>('#license-dialog');
    dialog?.showModal();
    if (license.notice && !license.checking) document.querySelector<HTMLElement>('#license-notice')?.focus();
  }
}

function demoPreview(): string {
  const stats = summarize(ledger);
  const invoice = ledger.invoices.find((item) => item.id === 'INV-105') ?? ledger.invoices[0];
  const transaction = ledger.transactions.find((item) => item.id === 'demo-payment-2') ?? ledger.transactions[0];
  if (!invoice || !transaction) return '';
  const confirmed = ledger.matches.some((match) => match.invoiceId === invoice.id);
  return `<div class="demo-preview" aria-label="Sample match preview"><div class="demo-summary"><strong>${stats.matched} matched</strong><span>${stats.open} invoices to review</span></div><div class="demo-row"><div><span>INVOICE</span><strong>${html(invoice.id)} · ${html(invoice.customer)}</strong><b>${money(invoice.amount, invoice.currency)}</b></div><div><span>PAYMENT</span><strong>${html(transaction.reference)}</strong><b>${money(transaction.amount, transaction.currency)}</b></div></div>${confirmed ? '<a class="secondary-button" href="#match-title">Review confirmed match</a>' : `<button class="primary-button" type="button" data-confirm="${html(invoice.id)}" data-transaction="${html(transaction.id)}">Confirm match</button>`}</div>`;
}

function importTray(kind: ImportKind, count: number, title: string, hint: string, sample: string): string {
  return `<article class="import-tray ${count ? 'has-data' : ''}">
    <div class="tray-icon">${count ? icon('check') : icon('file')}</div>
    <div><p class="tray-kicker">${kind === 'invoice' ? 'List A' : 'List B'}</p><h3>${title}</h3><p>${count ? `${count} row${count === 1 ? '' : 's'} loaded locally` : hint}</p></div>
    <div class="tray-actions"><label class="primary-button file-button">${count ? 'Replace CSV' : 'Choose CSV'}<input data-file-kind="${kind}" type="file" accept="text/csv,.csv"></label><button type="button" class="text-button" data-sample="${encodeURIComponent(sample)}" data-name="${kind}-sample.csv">Download sample CSV</button></div>
  </article>`;
}

function mappingPanel(item: PendingImport): string {
  const invoice = item.kind === 'invoice';
  const fields = invoice
    ? [['id', 'Invoice number', true], ['amount', 'Amount', true], ['customer', 'Customer', false], ['date', 'Invoice date', false], ['dueDate', 'Due date', false], ['currency', 'Currency', false]]
    : [['date', 'Payment date', true], ['amount', 'Amount', true], ['reference', 'Reference or description', false], ['currency', 'Currency', false]];
  return `<form class="mapping-panel" id="mapping-form">
    <div><p class="step-label">Check columns</p><h3>${html(item.fileName)}</h3><p>${item.csv.rows.length} data rows found. Confirm how your headings map before import.</p></div>
    <div class="mapping-grid">${fields.map(([key, label, required]) => `<label>${label}${required ? ' <span>required</span>' : ''}<select name="${key}" ${required ? 'required' : ''}><option value="">${required ? 'Choose a column' : 'Not included'}</option>${item.csv.headers.map(header => `<option value="${html(header)}" ${item.mapping[key as keyof typeof item.mapping] === header ? 'selected' : ''}>${html(header)}</option>`).join('')}</select></label>`).join('')}</div>
    <label class="check-row"><input name="keepSource" type="checkbox"><span><strong>Keep a copy of this source CSV on this device</strong><small>Off by default. Backups include it when selected.</small></span></label>
    <div class="button-row"><button class="primary-button" type="submit">Import ${invoice ? 'invoices' : 'payments'}</button><button class="secondary-button" type="button" data-action="cancel-import">Cancel</button></div>
  </form>`;
}

function invoiceRow(invoice: Ledger['invoices'][number]): string {
  const candidates = suggestionsFor(invoice, ledger);
  const top = candidates[0];
  if (!top) return `<article class="match-row no-match"><div class="invoice-cell"><span class="status-dot"></span><div><strong>${html(invoice.id)}</strong><small>${html(invoice.customer || 'Unnamed customer')} · ${dateLabel(invoice.date)}</small></div><b>${money(invoice.amount, invoice.currency)}</b></div><div class="suggestion-cell"><p>No payment has the same amount.</p><button type="button" class="secondary-button" data-manual="${html(invoice.id)}">Choose a payment</button></div></article>`;
  return `<article class="match-row ${top.ambiguous ? 'ambiguous' : ''}">
    <div class="invoice-cell"><span class="status-dot"></span><div><strong>${html(invoice.id)}</strong><small>${html(invoice.customer || 'Unnamed customer')} · ${dateLabel(invoice.date)}</small></div><b>${money(invoice.amount, invoice.currency)}</b></div>
    <div class="match-bridge" aria-hidden="true">${icon(top.ambiguous ? 'warning' : 'link')}</div>
    <div class="suggestion-cell"><div><p class="suggestion-label">${top.ambiguous ? 'Needs a closer look' : top.score >= 90 ? 'Strong suggestion' : 'Possible match'}</p><strong>${dateLabel(top.transaction.date)} · ${money(top.transaction.amount, top.transaction.currency)}</strong><small>${html(top.transaction.reference || 'No payment reference')}</small><p class="reason">${top.reasons.join(' · ')}</p></div><div class="row-actions">${top.ambiguous ? '' : `<button class="primary-button" type="button" data-confirm="${html(invoice.id)}" data-transaction="${html(top.transaction.id)}">Confirm match</button>`}<button class="secondary-button" type="button" data-manual="${html(invoice.id)}">${top.ambiguous ? candidates.length > 1 ? `Compare ${candidates.length} payments` : 'Review payment manually' : 'Choose another'}</button></div></div>
  </article>`;
}

function matchRow(match: Match): string {
  const invoice = ledger.invoices.find((item) => item.id === match.invoiceId);
  const transaction = ledger.transactions.find((item) => item.id === match.transactionId);
  if (!invoice || !transaction) return '';
  return `<tr><td><strong>${html(invoice.id)}</strong><small>${html(invoice.customer)}</small></td><td>${dateLabel(transaction.date)}</td><td class="numeric">${money(invoice.amount, invoice.currency)}</td><td><span class="method-tag">${match.method === 'manual' ? 'Manual' : 'Suggested'}</span></td><td>${html(match.note || '—')}</td><td><button class="text-button" type="button" data-undo="${html(match.id)}" aria-label="Undo match for ${html(invoice.id)}">Undo</button></td></tr>`;
}

function missingFileState(): string {
  const missing = ledger.invoices.length ? 'payment export' : 'open invoice list';
  return `<div class="empty-strip">${icon('file')}<div><h3>Add the ${missing}</h3><p>Both files are needed before Matchbox can suggest pairs.</p></div><a href="#workspace">Choose CSV above</a></div>`;
}

function manualDialog(): string {
  const invoice = ledger.invoices.find((item) => item.id === manualInvoiceId);
  if (!invoice) return '<dialog id="match-dialog"></dialog>';
  const used = new Set(ledger.matches.map((match) => match.transactionId));
  const options = ledger.transactions.filter((transaction) => !used.has(transaction.id));
  return `<dialog id="match-dialog" aria-labelledby="manual-title"><form method="dialog" class="dialog-shell" id="manual-form"><div class="dialog-head"><div><p class="step-label">Manual match</p><h2 id="manual-title">Match ${html(invoice.id)}</h2></div><button class="icon-button" value="cancel" aria-label="Close dialog">×</button></div><p>Choose the payment you verified. A note is required so the decision remains auditable.</p><label>Payment<select name="transactionId" required><option value="">Choose an unmatched payment</option>${options.map(transaction => `<option value="${html(transaction.id)}">${dateLabel(transaction.date)} · ${money(transaction.amount, transaction.currency)} · ${html(transaction.reference || 'No reference')}</option>`).join('')}</select></label><label>Why this is the right match<textarea name="note" required minlength="3" maxlength="240" placeholder="For example: Client confirmed the combined reference by email"></textarea></label><div class="button-row"><button class="primary-button" value="default" type="submit">Save manual match</button><button class="secondary-button" value="cancel" type="button" data-action="close-manual">Cancel</button></div></form></dialog>`;
}

function licenseDialog(): string {
  return `<dialog id="license-dialog" aria-labelledby="license-title"><div class="dialog-shell license-shell"><div class="dialog-head"><div><p class="step-label">Buy or restore Matchbox Plus</p><h2 id="license-title">Matchbox Plus</h2></div><button class="icon-button" type="button" data-action="close-license" aria-label="Close dialog">×</button></div><p class="price"><strong>$19</strong> once · no subscription</p><p>The complete matcher, manual review, reports, backups, and offline use are free. Plus confirms clear strong suggestions together. It also remembers column mappings.</p>${license.unlocked ? `<div class="license-active" id="license-notice" role="status" tabindex="-1">${icon('check')}<div><strong>Plus is active</strong><small>${html(license.notice || 'License saved on this device.')}</small></div></div>` : `<a class="primary-button full-button" href="${checkoutUrl()}">Buy Matchbox Plus</a><p class="legal-note">Checkout is hosted by Sociobot. See the checkout page for merchant and refund terms.</p><form id="restore-form" aria-busy="${license.checking}"><label>Have a license? Paste it here<input name="license" autocomplete="off" spellcheck="false" required></label><button class="secondary-button" type="submit" ${license.checking ? 'disabled' : ''}>${license.checking ? 'Checking license…' : 'Restore purchase'}</button></form>${license.notice ? `<p class="notice" id="license-notice" role="status" aria-live="polite" tabindex="-1">${html(license.notice)}</p>` : ''}`}<p class="legal-note"><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p></div></dialog>`;
}

async function persist(message: string): Promise<void> {
  statusMessage = message;
  render();
  await saveLedger(ledger, isDemo);
}

function addMatch(invoiceId: string, transactionId: string, method: Match['method'], note = ''): void {
  ledger.matches.push({ id: crypto.randomUUID(), invoiceId, transactionId, method, note, matchedAt: new Date().toISOString() });
}

async function handleFile(file: File, kind: ImportKind): Promise<void> {
  if (file.size > 5_000_000) throw new Error('That file is over 5 MB. Export a smaller month or split it before importing.');
  const text = await file.text();
  const csv = parseCsv(text);
  pending = { kind, fileName: file.name, text, csv, mapping: kind === 'invoice' ? suggestInvoiceMapping(csv.headers) : suggestTransactionMapping(csv.headers) };
  const saved = license.unlocked ? localStorage.getItem(mappingKey(kind, csv.headers)) : null;
  if (saved) pending.mapping = JSON.parse(saved) as InvoiceMapping | TransactionMapping;
  statusMessage = `${csv.rows.length} rows found in ${file.name}. Check the column mapping.`;
  render();
  document.querySelector('#mapping-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function applyImport(form: HTMLFormElement): Promise<void> {
  if (!pending) return;
  const importKind = pending.kind;
  const values = new FormData(form);
  const keys = pending.kind === 'invoice' ? ['id', 'customer', 'date', 'dueDate', 'amount', 'currency'] : ['date', 'amount', 'reference', 'currency'];
  const mapping = Object.fromEntries(keys.map((key) => [key, String(values.get(key) ?? '')])) as InvoiceMapping | TransactionMapping;
  if (pending.kind === 'invoice') {
    const rows = invoicesFromCsv(pending.csv, mapping as InvoiceMapping);
    if (ledger.invoices.length && !confirm(`Replace ${ledger.invoices.length} invoices? Existing matches will also be removed.`)) return;
    ledger.invoices = rows;
    ledger.matches = [];
  } else {
    const rows = transactionsFromCsv(pending.csv, mapping as TransactionMapping);
    if (ledger.transactions.length && !confirm(`Replace ${ledger.transactions.length} payments? Existing matches will also be removed.`)) return;
    ledger.transactions = rows;
    ledger.matches = [];
  }
  if (values.get('keepSource')) {
    ledger.sourceFiles = [...(ledger.sourceFiles ?? []).filter((source) => source.kind !== importKind), { kind: importKind, name: pending.fileName, text: pending.text, savedAt: new Date().toISOString() }];
  } else ledger.sourceFiles = (ledger.sourceFiles ?? []).filter((source) => source.kind !== importKind);
  if (license.unlocked) localStorage.setItem(mappingKey(importKind, pending.csv.headers), JSON.stringify(mapping));
  const message = `${pending.csv.rows.length} ${pending.kind === 'invoice' ? 'invoices' : 'payments'} imported.`;
  pending = null;
  await persist(message);
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportReport(): void {
  const byInvoice = new Map(ledger.matches.map((match) => [match.invoiceId, match]));
  const rows = [['status', 'invoice_number', 'customer', 'invoice_date', 'invoice_amount', 'currency', 'payment_date', 'payment_amount', 'payment_reference', 'match_method', 'note', 'matched_at']];
  ledger.invoices.forEach((invoice) => {
    const match = byInvoice.get(invoice.id);
    const transaction = match ? ledger.transactions.find((item) => item.id === match.transactionId) : undefined;
    rows.push([match ? 'matched' : 'open', invoice.id, invoice.customer, invoice.date, String(invoice.amount), invoice.currency, transaction?.date ?? '', transaction ? String(transaction.amount) : '', transaction?.reference ?? '', match?.method ?? '', match?.note ?? '', match?.matchedAt ?? '']);
  });
  const usedPaymentIds = new Set(ledger.matches.map((match) => match.transactionId));
  ledger.transactions.filter((transaction) => !usedPaymentIds.has(transaction.id)).forEach((transaction) => {
    rows.push(['unused_payment', '', '', '', '', transaction.currency, transaction.date, String(transaction.amount), transaction.reference, '', '', '']);
  });
  download(`matchbox-report-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((row) => row.map(escapeCsv).join(',')).join('\n'), 'text/csv;charset=utf-8');
  statusMessage = 'Reconciliation report exported.';
  render();
}

app.addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement;
  try {
    if (input.dataset.fileKind && input.files?.[0]) await handleFile(input.files[0], input.dataset.fileKind as ImportKind);
    if (input.id === 'backup-input' && input.files?.[0]) {
      const restored = parseLedgerBackup(JSON.parse(await input.files[0].text()) as unknown);
      ledger = restored;
      await persist('Workspace backup imported.');
    }
  } catch (error) {
    statusMessage = error instanceof Error ? error.message : 'The file could not be read.';
    render();
    alert(statusMessage);
  }
});

app.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formId = form.getAttribute('id');
  try {
    if (formId === 'mapping-form') await applyImport(form);
    if (formId === 'manual-form') {
      const values = new FormData(form);
      const transactionId = String(values.get('transactionId') ?? '');
      const note = String(values.get('note') ?? '').trim();
      if (!transactionId || note.length < 3) return;
      addMatch(manualInvoiceId, transactionId, 'manual', note);
      manualInvoiceId = '';
      await persist('Manual match saved with its note.');
    }
    if (formId === 'restore-form') await restoreLicense(String(new FormData(form).get('license') ?? ''));
  } catch (error) {
    statusMessage = error instanceof Error ? error.message : 'That action could not be completed.';
    render();
    alert(statusMessage);
  }
});

app.addEventListener('click', async (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('button, a');
  if (!target) return;
  if (target instanceof HTMLAnchorElement) {
    const destination = new URL(target.href, location.href);
    if (destination.origin === location.origin && (destination.pathname !== location.pathname || destination.search !== location.search)) {
      sessionStorage.setItem('matchbox:route-focus', `${destination.pathname}${destination.search}`);
    }
  }
  if (isDemo && target instanceof HTMLAnchorElement) {
    const destination = new URL(target.href, location.href);
    const staysInDemo = (destination.pathname === '/demo' || destination.pathname === '/demo/') || (destination.pathname === location.pathname && destination.hash);
    if (!staysInDemo) {
      event.preventDefault();
      await clearLedger(true);
      location.assign(destination.href);
      return;
    }
  }
  if (target.dataset.confirm && target.dataset.transaction) {
    addMatch(target.dataset.confirm, target.dataset.transaction, 'suggested');
    await persist(`Match confirmed for ${target.dataset.confirm}.`);
  } else if (target.dataset.manual) {
    manualInvoiceId = target.dataset.manual;
    render();
    (document.querySelector('#match-dialog') as HTMLDialogElement)?.showModal();
  } else if (target.dataset.undo) {
    ledger.matches = ledger.matches.filter((match) => match.id !== target.dataset.undo);
    await persist('Match undone. The invoice and payment are available again.');
  } else if (target.dataset.sample) download(target.dataset.name ?? 'sample.csv', decodeURIComponent(target.dataset.sample), 'text/csv');
  else if (target.dataset.action === 'cancel-import') { pending = null; render(); }
  else if (target.dataset.action === 'show-all') { showAllOpen = true; render(); }
  else if (target.dataset.action === 'export-report') exportReport();
  else if (target.dataset.action === 'export-json') download(`matchbox-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(ledger, null, 2), 'application/json');
  else if (target.dataset.action === 'clear') {
    if (confirm(`Clear ${ledger.invoices.length} invoices, ${ledger.transactions.length} payments, and ${ledger.matches.length} matches from this browser? This cannot be undone.`)) {
      await clearLedger(isDemo);
      ledger = emptyLedger();
      pending = null;
      statusMessage = isDemo ? 'Demo ledger cleared. Reset the demo to restore its sample data.' : 'Local workspace cleared.';
      render();
    }
  } else if (target.dataset.action === 'close-manual') (document.querySelector('#match-dialog') as HTMLDialogElement)?.close();
  else if (target.dataset.action === 'open-license') { licenseDialogOpen = true; (document.querySelector('#license-dialog') as HTMLDialogElement)?.showModal(); }
  else if (target.dataset.action === 'close-license') { licenseDialogOpen = false; (document.querySelector('#license-dialog') as HTMLDialogElement)?.close(); }
  else if (target.dataset.action === 'reset-demo' && isDemo) {
    ledger = sampleLedger(); pending = null; manualInvoiceId = ''; showAllOpen = false; await persist('Demo reset to its original sample data.');
  } else if (target.dataset.action === 'start-real' && isDemo) {
    await clearLedger(true); sessionStorage.setItem('matchbox:route-focus', '/'); window.location.assign('/');
  }
  else if (target.dataset.action === 'batch-confirm' && license.unlocked) {
    const open = ledger.invoices.filter((invoice) => !ledger.matches.some((match) => match.invoiceId === invoice.id));
    let count = 0;
    for (const invoice of open) {
      const candidate = suggestionsFor(invoice, ledger)[0];
      if (candidate && candidate.score >= 90 && !candidate.ambiguous) { addMatch(invoice.id, candidate.transaction.id, 'suggested'); count += 1; }
    }
    await persist(count ? `${count} strong matches confirmed.` : 'No unambiguous strong matches are waiting.');
  } else if (target.dataset.action === 'reload') window.location.reload();
});

window.addEventListener('online', render);
window.addEventListener('offline', render);

function focusRouteDestination(): void {
  const focusedBeforeDelay = document.activeElement;
  window.setTimeout(() => {
    const activeElement = document.activeElement;
    if (activeElement !== focusedBeforeDelay && activeElement !== document.body) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const routeKey = `${location.pathname}${location.search}`;
    const historyTraversal = performance.getEntriesByType('navigation').some((entry) => (entry as PerformanceNavigationTiming).type === 'back_forward');
    const routeNavigation = sessionStorage.getItem('matchbox:route-focus') === routeKey || historyTraversal;
    if (!id && !routeNavigation) return;
    if (routeNavigation) sessionStorage.removeItem('matchbox:route-focus');
    const hashTarget = id ? document.getElementById(id) : null;
    const target = hashTarget?.querySelector<HTMLElement>('h1, h2, h3') ?? hashTarget ?? document.querySelector<HTMLElement>('main h1');
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    if (id) target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: Boolean(id) });
    statusMessage = id ? `${target.textContent?.trim() ?? 'Section'} opened.` : `${document.title} opened.`;
    document.querySelector<HTMLElement>('#live-status')!.textContent = statusMessage;
  }, 50);
}

window.addEventListener('hashchange', focusRouteDestination);
window.addEventListener('pageshow', (event) => { if (event.persisted) focusRouteDestination(); });

app.addEventListener('close', (event) => {
  if ((event.target as HTMLElement).id === 'license-dialog') licenseDialogOpen = false;
}, true);

subscribeLicense((next) => {
  const changed = next.unlocked !== license.unlocked || next.notice !== license.notice || next.checking !== license.checking;
  license = next;
  if (changed && started) render();
});

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        const toast = document.querySelector<HTMLElement>('#update-toast');
        if (toast) toast.hidden = false;
      }
    });
  });
}

async function start(): Promise<void> {
  try {
    ledger = await loadLedger(isDemo);
    if (isDemo && ledger.invoices.length === 0 && ledger.transactions.length === 0) {
      ledger = sampleLedger();
      await saveLedger(ledger, true);
    }
    statusMessage = isDemo ? 'Demo sample ready.' : 'Local workspace ready.';
  }
  catch { ledger = emptyLedger(); statusMessage = 'Local storage is unavailable. You can work, but refresh will clear this session.'; }
  started = true;
  render();
  focusRouteDestination();
  void initLicense();
  void registerServiceWorker();
}

void start();
