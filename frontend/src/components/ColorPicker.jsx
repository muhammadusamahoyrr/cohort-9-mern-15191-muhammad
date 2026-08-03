import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ColorIcon } from './icons';
import { DEFAULT_NOTE_COLOR, NOTE_COLORS } from './notePalette';
import useDismiss from '../hooks/useDismiss';

// Swatch grid above the editor's action strip. Picking a color applies it
// straight away, so "Done" only has to dismiss.
export default function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = value || DEFAULT_NOTE_COLOR;

  useDismiss(ref, open, () => setOpen(false));

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="iconbtn"
        aria-label="Note colour"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <ColorIcon />
      </button>

      {open && (
        <div className="swatches" role="dialog" aria-label="Note colour">
          <div className="swatches__head">
            <span className="swatches__title">Colors</span>
            <button type="button" className="swatches__done" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>

          <div className="swatches__grid">
            {NOTE_COLORS.map((color) => {
              const selected = color.toLowerCase() === current.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  className={clsx('swatch', selected && 'swatch--on')}
                  style={{ background: color }}
                  aria-label={color}
                  aria-pressed={selected}
                  onClick={() => onChange(color)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

ColorPicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
