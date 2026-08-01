import { emptyChecklist, parseChecklist, serializeChecklist } from '../../utils/todoContent';

describe('todoContent', () => {
  it('round-trips items through the stored HTML', () => {
    const items = [
      { id: 'a', text: 'milk', done: false },
      { id: 'b', text: 'eggs', done: true },
    ];

    const parsed = parseChecklist(serializeChecklist(items));

    expect(parsed.map(({ text, done }) => ({ text, done }))).toEqual([
      { text: 'milk', done: false },
      { text: 'eggs', done: true },
    ]);
  });

  it('drops blank rows on the way out', () => {
    const html = serializeChecklist([
      { id: 'a', text: 'milk', done: false },
      { id: 'b', text: '   ', done: false },
    ]);

    expect(parseChecklist(html)).toHaveLength(1);
  });

  it('escapes markup in item text rather than storing it as HTML', () => {
    const html = serializeChecklist([{ id: 'a', text: '<img src=x onerror=1>', done: false }]);

    expect(html).not.toContain('<img');
    expect(parseChecklist(html)[0].text).toBe('<img src=x onerror=1>');
  });

  it('gives an empty note one blank row to type into', () => {
    expect(parseChecklist('')).toHaveLength(1);
    expect(emptyChecklist()[0]).toMatchObject({ text: '', done: false });
  });

  it('reads plain list items that carry no state glyph', () => {
    expect(parseChecklist('<ul><li>legacy item</li></ul>')).toMatchObject([
      { text: 'legacy item', done: false },
    ]);
  });
});
