const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export const toBn = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
export const taka = (n) => `${toBn(n)}৳`;

// Accepts 017..., +88017..., 88017... and Bangla digits. Returns 01XXXXXXXXX (or garbage if invalid).
export function normalizePhone(raw) {
  let s = String(raw ?? '').replace(/[\s\-()]/g, '');
  s = s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
  return s.replace(/^\+?88/, '');
}

export const BD_PHONE_RE = /^01[3-9]\d{8}$/;
export const isValidPhone = (raw) => BD_PHONE_RE.test(normalizePhone(raw));
