const OPEN = '☐';
const DONE = '☑';

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `i${Math.random().toString(36).slice(2)}`;

/**
 * @typedef {Object} ChecklistItem
 * @property {string}  id    client-side only, never persisted
 * @property {string}  text
 * @property {boolean} done
 */

/**
 * A checklist with one blank row, so the editor always has something to focus.
 * @returns {ChecklistItem[]}
 */
export const emptyChecklist = () => [{ id: newId(), text: '', done: false }];

/**
 * Reads a stored note body back into checklist items. Anything that is not a
 * list, including empty input, yields a single blank row.
 *
 * @param {string} html
 * @returns {ChecklistItem[]}
 */
export function parseChecklist(html) {
  if (!html) return emptyChecklist();

  const template = document.createElement('template');
  template.innerHTML = html;

  const items = [...template.content.querySelectorAll('li')].map((li) => {
    const raw = (li.textContent || '').trim();
    const done = raw.startsWith(DONE);
    return {
      id: newId(),
      done,
      text: done || raw.startsWith(OPEN) ? raw.slice(1).trim() : raw,
    };
  });

  return items.length ? items : emptyChecklist();
}

/**
 * Renders checklist items to stored HTML, dropping blank rows. Returns an
 * empty string when nothing survives, so an untouched checklist saves as empty
 * rather than as an empty list element.
 *
 * @param {ChecklistItem[]} items
 * @returns {string}
 */
export function serializeChecklist(items) {
  const rows = items
    .filter((item) => item.text.trim() !== '')
    .map((item) => `<li>${item.done ? DONE : OPEN} ${escapeHtml(item.text.trim())}</li>`)
    .join('');

  return rows ? `<ul>${rows}</ul>` : '';
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
