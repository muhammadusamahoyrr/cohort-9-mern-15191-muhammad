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

export function formatDateTime(iso) {
  const date = new Date(iso);
  return isValid(date) ? dateAndTime.format(date) : '';
}

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

export function formatDayHeading(iso) {
  const date = new Date(iso);
  if (!isValid(date)) return '';

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (differenceInCalendarDays(new Date(), date) < 7) return weekday.format(date);
  return dateOnly.format(date);
}

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
