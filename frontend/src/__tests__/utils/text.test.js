import { countWords, isEmpty, plainText } from '../../utils/text';

describe('Utils: text', () => {
  describe('plainText', () => {
    it('extracts plain text and preserves spacing between closing block tags', () => {
      const html = '<ul><li>First item</li><li>Second item</li></ul>';
      expect(plainText(html)).toBe('First item Second item ');
    });

    it('returns empty string on null or undefined input', () => {
      expect(plainText(null)).toBe('');
      expect(plainText(undefined)).toBe('');
      expect(plainText('')).toBe('');
    });
  });

  describe('isEmpty', () => {
    it('identifies blank and whitespace-only html documents as empty', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('<p><br></p>')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('identifies content-bearing html as not empty', () => {
      expect(isEmpty('<p>Hello World</p>')).toBe(false);
    });
  });

  describe('countWords', () => {
    it('counts words across list items accurately', () => {
      const html = '<ul><li>Coffee</li><li>Olive oil</li><li>Bread</li></ul>';
      expect(countWords(html)).toBe(4);
    });

    it('returns 0 for empty or whitespace-only content', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('<p></p>')).toBe(0);
    });
  });
});
