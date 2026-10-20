/**
 * Lebanese phone numbers. Accepts "70 123 456", "03 123 456", "+961 70 123456",
 * "00961 1 234567"... and normalizes to E.164 ("+96170123456").
 */
const NATIONAL = /^(3\d{6}|(70|71|76|78|79|81)\d{6}|[1456789]\d{6})$/;

export function normalizeLebanesePhone(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+961")) digits = digits.slice(4);
  else if (digits.startsWith("00961")) digits = digits.slice(5);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.startsWith("0")) digits = digits.slice(1);
  return NATIONAL.test(digits) ? `+961${digits}` : null;
}

/** "+96170123456" -> "+961 70 123 456" for display. */
export function formatLebanesePhone(e164: string) {
  const national = e164.replace(/^\+961/, "");
  const prefixLength = national.length === 8 ? 2 : 1;
  const prefix = national.slice(0, prefixLength);
  const rest = national.slice(prefixLength);
  return `+961 ${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`.trim();
}
