// The API sends ISO-8601 UTC strings; turning them into local time is the
// browser's job (see docs/02-DATABASE.md, "Time zones").

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/** "just now" / "3 hours ago" for anything recent, a plain date beyond a week. */
export function formatRelative(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const elapsed = Date.now() - date.getTime();
  if (elapsed < MINUTE) return 'just now';

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (elapsed < HOUR) return rtf.format(-Math.floor(elapsed / MINUTE), 'minute');
  if (elapsed < DAY) return rtf.format(-Math.floor(elapsed / HOUR), 'hour');
  if (elapsed < 7 * DAY) return rtf.format(-Math.floor(elapsed / DAY), 'day');

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
