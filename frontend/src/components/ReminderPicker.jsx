import { useRef, useState } from 'react';
import clsx from 'clsx';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isWeekend,
  startOfMonth,
} from 'date-fns';
import { ReminderIcon } from './icons';
import useDismiss from '../hooks/useDismiss';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Blank cells first, so the 1st lands under the right weekday.
function monthGrid(month) {
  const start = startOfMonth(month);
  const blanks = Array(getDay(start)).fill(null);
  return [...blanks, ...eachDayOfInterval({ start, end: endOfMonth(month) })];
}

/**
 * Reminder date-and-time popover. The calendar works, but "Set" is inert:
 * storing a reminder needs a field the note doesn't have yet.
 */
export default function ReminderPicker() {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [time, setTime] = useState(() => format(new Date(), 'HH:mm'));
  const ref = useRef(null);
  const today = new Date();

  useDismiss(ref, open, () => setOpen(false));

  const step = (months) => setMonth((m) => addMonths(m, months));

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="iconbtn"
        aria-label="Set reminder"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <ReminderIcon />
      </button>

      {open && (
        <div className="reminder" role="dialog" aria-label="Set reminder">
          <p className="reminder__title">Reminder on</p>

          <div className="reminder__fields">
            <input
              type="date"
              className="setselect"
              aria-label="Reminder date"
              value={format(selected, 'yyyy-MM-dd')}
              onChange={(e) => {
                if (!e.target.value) return;
                const next = new Date(`${e.target.value}T00:00:00`);
                setSelected(next);
                setMonth(next);
              }}
            />
            <input
              type="time"
              className="setselect"
              aria-label="Reminder time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="reminder__month">
            <span className="reminder__monthname">
              {format(month, 'MMMM yyyy').toUpperCase()}
            </span>
            <span className="reminder__nav">
              <button type="button" aria-label="Previous year" onClick={() => step(-12)}>
                «
              </button>
              <button type="button" aria-label="Previous month" onClick={() => step(-1)}>
                ‹
              </button>
              <button type="button" aria-label="Next month" onClick={() => step(1)}>
                ›
              </button>
              <button type="button" aria-label="Next year" onClick={() => step(12)}>
                »
              </button>
            </span>
          </div>

          <div className="reminder__grid" role="grid">
            {WEEKDAYS.map((day) => (
              <span key={day} className="reminder__weekday">
                {day}
              </span>
            ))}

            {monthGrid(month).map((date, i) =>
              date === null ? (
                <span key={`pad-${i}`} />
              ) : (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={clsx(
                    'reminder__day',
                    isSameDay(date, selected) && 'reminder__day--on',
                    isWeekend(date) && 'reminder__day--weekend',
                    isSameDay(date, today) && 'reminder__day--today'
                  )}
                  onClick={() => setSelected(date)}
                >
                  {date.getDate()}
                </button>
              )
            )}
          </div>

          <div className="reminder__row">
            <span>Repeat</span>
            <select className="setselect" aria-label="Repeat" defaultValue="never" disabled>
              <option value="never">Never</option>
            </select>
          </div>

          <label className="reminder__check">
            <input type="checkbox" disabled />
            Receive Reminder Emails
          </label>

          <div className="reminder__actions">
            <button
              type="button"
              className="btn btn--secondary btn--small"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="btn btn--primary btn--small" disabled>
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
