export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime())
    && parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() + 1 === month
    && parsed.getUTCDate() === day;
}

export function normalizedDate(value: string): string {
  const source = value.trim();
  if (!source) return '';

  const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T ]|$)/.exec(source);
  if (iso) {
    const normalized = `${iso[1]}-${iso[2]?.padStart(2, '0')}-${iso[3]?.padStart(2, '0')}`;
    return isCalendarDate(normalized) ? normalized : '';
  }

  const common = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(source);
  if (common) {
    const normalized = `${common[3]}-${common[2]?.padStart(2, '0')}-${common[1]?.padStart(2, '0')}`;
    return isCalendarDate(normalized) ? normalized : '';
  }

  const parsed = new Date(source);
  if (!Number.isFinite(parsed.getTime())) return '';
  const normalized = parsed.toISOString().slice(0, 10);
  return isCalendarDate(normalized) ? normalized : '';
}
