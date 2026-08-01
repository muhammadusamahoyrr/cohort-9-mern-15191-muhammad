import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import useSettings from '../hooks/useSettings';
import { SETTINGS_SECTIONS } from './settingsSchema';
import { ChevronDownIcon, CloseIcon } from './icons';

function Toggle({ label, checked, disabled, onChange }) {
  return (
    <label className={clsx('toggle', disabled && 'toggle--off-limits')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__knob" />
      </span>
    </label>
  );
}

// a value plus a chevron, i.e. the "opens another screen" kind of row
function LinkValue({ label, value, disabled }) {
  return (
    <button type="button" className="setlink" aria-label={label} disabled={disabled}>
      {value && <span className="setlink__value">{value}</span>}
      <ChevronDownIcon width={16} height={16} className="setlink__chevron" />
    </button>
  );
}

// the two layout thumbnails, drawn in CSS instead of shipped as images
function LayoutChoice({ value, current, onSelect, label }) {
  const active = value === current;
  return (
    <button
      type="button"
      className={clsx('layoutpick', active && 'layoutpick--active')}
      aria-pressed={active}
      onClick={() => onSelect(value)}
    >
      <span className={`layoutpick__art layoutpick__art--${value}`} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="layoutpick__label">{label}</span>
    </button>
  );
}

function Row({ row, settings, set }) {
  // live rows read and write the store, the rest just show a static default
  const live = Boolean(row.enabled);
  const value = live ? settings[row.key] : row.value;

  if (row.type === 'layout') {
    return (
      <div className="layoutpicks">
        <LayoutChoice
          value="grid"
          label="Grid"
          current={settings.layout}
          onSelect={(v) => set('layout', v)}
        />
        <LayoutChoice
          value="multipane"
          label="Multipane"
          current={settings.layout}
          onSelect={(v) => set('layout', v)}
        />
      </div>
    );
  }

  return (
    <div className={clsx('setrow', !live && 'setrow--inert')}>
      <div className="setrow__text">
        <span className="setrow__label">{row.label}</span>
        {row.hint && <p className="setrow__hint">{row.hint}</p>}
      </div>

      <div className="setrow__control">
        {row.type === 'toggle' && (
          <Toggle
            label={row.label}
            checked={Boolean(value)}
            disabled={!live}
            onChange={live ? (v) => set(row.key, v) : undefined}
          />
        )}

        {row.type === 'select' && (
          <select
            className="setselect"
            aria-label={row.label}
            value={value}
            disabled={!live}
            onChange={live ? (e) => set(row.key, e.target.value) : undefined}
          >
            {row.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        {row.type === 'link' && (
          <LinkValue label={row.label} value={row.value} disabled={!live} />
        )}
      </div>
    </div>
  );
}

export default function SettingsDrawer({ open, onClose }) {
  const { settings, set } = useSettings();
  const panelRef = useRef(null);

  // escape closes, and focus moves in so keyboard users don't get left on the
  // trigger behind the panel
  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    panelRef.current?.querySelector('button')?.focus();

    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="drawer__head">
          <button type="button" className="iconbtn" aria-label="Close settings" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2 className="drawer__title">Settings</h2>
        </header>

        <div className="drawer__scroll">
          {SETTINGS_SECTIONS.map((section) => (
            <section key={section.key} className="setgroup">
              <h3 className="setgroup__title">{section.title}</h3>
              {section.rows.map((row) => (
                <Row key={row.key} row={row} settings={settings} set={set} />
              ))}
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}
