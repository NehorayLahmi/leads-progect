const BOT_TOKEN      = process.env.TELEGRAM_BOT_TOKEN ?? "";
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID  ?? "";

export async function sendTelegram(chatId: string | null | undefined, message: string): Promise<void> {
  const target = chatId?.trim() || DEFAULT_CHAT_ID;
  if (!BOT_TOKEN || !target) return;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: target, text: message, parse_mode: "HTML" }),
  }).catch(err => console.error("[telegram]", err));
}
