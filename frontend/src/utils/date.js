import {
  differenceInCalendarDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isToday,
  isValid,
  isYesterday,
} from 'date-fns';

const dateOnly = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const dateAndTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/**
 * Absolute date and time. Empty string for anything unparseable.
 * @param {string} iso  ISO 8601 date string
 * @returns {string}
 */
export function formatDateTime(iso) {
  const date = new Date(iso);
  return isValid(date) ? dateAndTime.format(date) : '';
}

/**
 * "just now", "5 minutes ago", then an absolute date past a week.
 * @param {string} iso  ISO 8601 date string
 * @returns {string}
 */
export function formatRelative(iso) {
  const date = new Date(iso);
  if (!isValid(date)) return '';

  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return relative.format(-minutes, 'minute');

  const hours = differenceInHours(now, date);
  if (hours < 24) return relative.format(-hours, 'hour');

  const days = differenceInDays(now, date);
  // "37 days ago" tells nobody anything, so past a week we show the date
  return days < 7 ? relative.format(-days, 'day') : dateOnly.format(date);
}

/**
 * "Today", "Yesterday", a weekday name, or an absolute date.
 * @param {string} iso  ISO 8601 date string
 * @returns {string}
 */
export function formatDayHeading(iso) {
  const date = new Date(iso);
  if (!isValid(date)) return '';

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (differenceInCalendarDays(new Date(), date) < 7) return weekday.format(date);
  return dateOnly.format(date);
}

/**
 * Collapses an already-sorted list into consecutive day runs. Order is
 * preserved; an unsorted list produces repeated headings.
 *
 * @param {import('../api/notes.api').Note[]} notes
 * @returns {{ heading: string, notes: import('../api/notes.api').Note[] }[]}
 */
export function groupByDay(notes) {
  const groups = [];

  notes.forEach((note) => {
    const heading = formatDayHeading(note.updatedAt);
    const last = groups[groups.length - 1];
    if (last && last.heading === heading) last.notes.push(note);
    else groups.push({ heading, notes: [note] });
  });

  return groups;
}
