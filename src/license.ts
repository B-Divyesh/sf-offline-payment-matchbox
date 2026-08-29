const SLUG = 'offline-payment-matchbox';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${TOKEN_KEY}:verdict`;
const BILLING_BASE = (import.meta.env.VITE_BILLING_BASE as string | undefined) ?? 'https://api.sociobot.in';

export type LicenseState = { token: string; unlocked: boolean; checking: boolean; notice: string };
let state: LicenseState = { token: '', unlocked: false, checking: false, notice: '' };
const listeners = new Set<(state: LicenseState) => void>();
let demoStorage = false;

function keyFor(key: string): string {
  return demoStorage ? `demo:${key}` : key;
}

/** Keeps every demo preference and license fixture out of the real workspace. */
export function configureLicense(demo: boolean): void {
  demoStorage = demo;
  state = { token: '', unlocked: false, checking: false, notice: '' };
}

export function scopedStorageKey(key: string): string {
  return keyFor(key);
}

function emit() {
  listeners.forEach((listener) => listener({ ...state }));
}

export function subscribeLicense(listener: (state: LicenseState) => void) {
  listeners.add(listener);
  listener({ ...state });
  return () => listeners.delete(listener);
}

export function checkoutUrl(): string {
  return `${BILLING_BASE}/api/v1/products/${SLUG}/checkout`;
}

export async function initLicense(): Promise<void> {
  const url = new URL(window.location.href);
  const returned = url.searchParams.get('license');
  if (returned) {
    localStorage.setItem(keyFor(TOKEN_KEY), returned);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  const token = returned ?? localStorage.getItem(keyFor(TOKEN_KEY)) ?? '';
  const cached = readVerdict();
  state = { token, unlocked: Boolean(token && (returned || cached?.valid)), checking: false, notice: '' };
  emit();
  if (!token) return;
  if (!returned && cached && Date.now() - cached.checkedAt < 86_400_000) return;
  await verifyLicense(token);
}

function readVerdict(): { valid: boolean; checkedAt: number } | null {
  try {
    return JSON.parse(localStorage.getItem(keyFor(VERDICT_KEY)) ?? 'null') as { valid: boolean; checkedAt: number } | null;
  } catch {
    return null;
  }
}

export async function verifyLicense(token = state.token): Promise<void> {
  if (!token) return;
  state = { ...state, token, checking: true, notice: '' };
  emit();
  try {
    const response = await fetch(`${BILLING_BASE}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = (await response.json()) as { valid: boolean; reason?: string };
    localStorage.setItem(keyFor(VERDICT_KEY), JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    state = {
      token,
      unlocked: result.valid,
      checking: false,
      notice: result.valid ? 'Matchbox Plus is active on this device.' : 'This license is no longer active.',
    };
  } catch {
    state = { ...state, checking: false, notice: 'Could not check the license while offline. Your last verified access is unchanged.' };
  }
  emit();
}

export async function restoreLicense(token: string): Promise<void> {
  const clean = token.trim();
  if (!clean) return;
  localStorage.setItem(keyFor(TOKEN_KEY), clean);
  await verifyLicense(clean);
}
