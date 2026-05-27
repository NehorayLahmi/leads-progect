// Strips HTML tags to prevent XSS
export function sanitize(val: string): string {
  return val.replace(/<[^>]*>/g, "").trim();
}

// Email — standard format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email);
}

// Israeli mobile/landline: 9-10 digits starting with 0
export function isValidPhone(phone: string): boolean {
  const d = phone.replace(/[\s\-().]/g, "");
  return /^0[0-9]{8,9}$/.test(d);
}

// Name: Hebrew / English letters, spaces, hyphens, apostrophes — 2–50 chars
export function isValidName(name: string): boolean {
  return /^[֐-׿יִ-ﭏa-zA-Z\s'\-]{2,50}$/.test(name);
}

// Password: min 6, max 100 chars
export function isValidPassword(pass: string): boolean {
  return pass.length >= 6 && pass.length <= 100;
}
