// Shared Constants for Templates and Forms

export const ISO_TEMPLATE_CODES = [
  'FQC-002-02',
  'FQC-003-02',
  'FQC-004-02',
  'FQC-005-02'
];

/**
 * Checks whether a template code or template object belongs to the ISO templates group.
 * @param {string|object} tplOrCode - Template code string or template object with code property
 * @returns {boolean}
 */
export function isIsoTemplate(tplOrCode) {
  if (!tplOrCode) return false;
  const rawCode = typeof tplOrCode === 'string' ? tplOrCode : tplOrCode?.code;
  if (!rawCode || typeof rawCode !== 'string') return false;
  const code = rawCode.trim().toUpperCase();
  return ISO_TEMPLATE_CODES.includes(code);
}

/**
 * Checks whether a template code or template object belongs to the Regular (Thường quy) templates group.
 * @param {string|object} tplOrCode
 * @returns {boolean}
 */
export function isRegularTemplate(tplOrCode) {
  return !isIsoTemplate(tplOrCode);
}
