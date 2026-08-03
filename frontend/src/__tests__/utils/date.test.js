import { formatDateTime, formatRelative } from '../../utils/date';

// The API always sends ISO-8601 UTC; these run against a fixed "now" so the
// relative output can't drift with the clock.
const NOW = new Date('2026-07-21T12:00:00.000Z');

beforeAll(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick'] });
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

const ago = (ms) => new Date(NOW.getTime() - ms).toISOString();

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatRelative', () => {
  it('calls anything under a minute "just now"', () => {
    expect(formatRelative(ago(30_000))).toBe('just now');
  });

  it('counts in minutes within the hour', () => {
    expect(formatRelative(ago(20 * MINUTE))).toMatch(/20 minutes ago/);
  });

  it('counts in hours within the day', () => {
    expect(formatRelative(ago(3 * HOUR))).toMatch(/3 hours ago/);
  });

  it('counts in days within the week', () => {
    expect(formatRelative(ago(3 * DAY))).toMatch(/3 days ago/);
  });

  it('falls back to a plain date beyond a week', () => {
    // "37 days ago" tells nobody anything useful.
    const older = formatRelative(ago(37 * DAY));
    expect(older).not.toMatch(/ago/);
    expect(older).toMatch(/2026/);
  });

  it('returns an empty string for a value it cannot parse', () => {
    expect(formatRelative('not-a-date')).toBe('');
    expect(formatRelative(undefined)).toBe('');
  });
});

describe('formatDateTime', () => {
  it('renders a date and a time', () => {
    const formatted = formatDateTime('2026-02-11T09:00:00.000Z');
    expect(formatted).toMatch(/2026/);
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns an empty string for a value it cannot parse', () => {
    expect(formatDateTime('')).toBe('');
  });
});
