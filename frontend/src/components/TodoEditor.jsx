import { useRef } from 'react';
import PropTypes from 'prop-types';
import { TrashIcon } from './icons';

export default function TodoEditor({ items, onChange }) {
  const rowsRef = useRef(null);

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  const update = (id, patch) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addAfter = (id) => {
    const next = { id: crypto.randomUUID(), text: '', done: false };
    const at = items.findIndex((i) => i.id === id);
    onChange([...items.slice(0, at + 1), next, ...items.slice(at + 1)]);
    requestAnimationFrame(() => {
      rowsRef.current?.querySelector(`[data-row="${next.id}"] input[type="text"]`)?.focus();
    });
  };

  const removeItem = (id) => onChange(items.filter((i) => i.id !== id));

  const onKeyDown = (e, item) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAfter(item.id);
    }
    if (e.key === 'Backspace' && item.text === '' && items.length > 1) {
      e.preventDefault();
      removeItem(item.id);
    }
  };

  const row = (item) => (
    <li key={item.id} className="todo__row" data-row={item.id}>
      <input
        type="checkbox"
        checked={item.done}
        aria-label={item.text || 'Untitled item'}
        onChange={(e) => update(item.id, { done: e.target.checked })}
      />
      <input
        type="text"
        className="todo__text"
        value={item.text}
        placeholder="List item"
        aria-label="List item"
        onChange={(e) => update(item.id, { text: e.target.value })}
        onKeyDown={(e) => onKeyDown(e, item)}
      />
    </li>
  );

  return (
    <div className="todo" ref={rowsRef}>
      <ul className="todo__list">{open.map(row)}</ul>

      {done.length > 0 && (
        <>
          <div className="todo__completed">
            <span className="todo__completedlabel">
              <input type="checkbox" checked readOnly aria-hidden="true" tabIndex={-1} />
              Completed
            </span>
            <button
              type="button"
              className="iconbtn"
              aria-label="Clear completed items"
              onClick={() => onChange(items.filter((i) => !i.done))}
            >
              <TrashIcon />
            </button>
          </div>
          <ul className="todo__list todo__list--done">{done.map(row)}</ul>
        </>
      )}
    </div>
  );
}

TodoEditor.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      done: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};
