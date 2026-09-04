export function extractServerFieldErrors(details) {
  if (!Array.isArray(details)) return {};

  const out = {};
  for (const item of details) {
    const field = item.field || item.path;
    if (field && !out[field]) {
      out[field] = item.message;
    }
  }
  return out;
}

export default {
  extractServerFieldErrors,
};
