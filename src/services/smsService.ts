// ─── TWILIO — מושבת ────────────────────────────────────────────────────────────
// להפעלה מחדש: בטל הערה, התקן `npm i twilio`, והגדר משתני סביבה:
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
//
// import twilio from "twilio";
// const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
// const isTwilioConfigured = Boolean(TWILIO_ACCOUNT_SID) && Boolean(TWILIO_AUTH_TOKEN) && Boolean(TWILIO_PHONE_NUMBER);
// const client = isTwilioConfigured ? twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!) : null;
//
// export async function sendSMS(to: string, message: string): Promise<void> {
//   if (!client || !TWILIO_PHONE_NUMBER) {
//     console.warn(`[SMS — dev] לא נשלח: ${to} | ${message}`);
//     return;
//   }
//   await client.messages.create({ body: message, from: TWILIO_PHONE_NUMBER, to: toE164(to) });
// }

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+972${digits.slice(1)}`;
  return phone;
}

export async function sendSMS(to: string, message: string): Promise<void> {
  console.log(`[SMS — מושבת] נמען: ${to} | הודעה: ${message}`);
}
