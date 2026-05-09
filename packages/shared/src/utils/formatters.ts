// Returns ISO 8601 string (UTC) — use for storage and API payloads
export function formatDate(date: string | number | Date): string {
  return new Date(date).toISOString();
}

// Returns locale-aware string — use for display only, not storage
export function formatTimestamp(date: string | number | Date): string {
  return new Date(date).toLocaleString();
}

// Appends ellipsis only when text exceeds maxLength
export function truncate(text: string, maxLength = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Strips non-word chars after lowercasing and collapsing spaces to hyphens
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

// randmId generate using crypto
export function randomId(): string {
  return crypto.randomUUID();
}
