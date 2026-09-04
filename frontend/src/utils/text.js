export function plainText(html) {
  const spaced = (html || '').replace(/<\/(p|li|h[1-6]|blockquote|pre|div)>/gi, '$& ');
  const template = document.createElement('template');
  template.innerHTML = spaced;
  return template.content.textContent || '';
}

export function isEmpty(html) {
  return plainText(html).trim() === '';
}

export function countWords(html) {
  const text = plainText(html).trim();
  return text ? text.split(/\s+/).length : 0;
}

export default {
  plainText,
  isEmpty,
  countWords,
};

