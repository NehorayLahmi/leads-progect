import prisma from "../config/database";

const BOT_TOKEN       = process.env.TELEGRAM_BOT_TOKEN ?? "";
const ADMIN_CHAT_ID   = process.env.TELEGRAM_CHAT_ID   ?? "";

async function send(chatId: string, message: string): Promise<void> {
  if (!BOT_TOKEN || !chatId) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
  }).catch(err => console.error("[telegram]", err));
}

export async function sendTelegram(chatId: string | null | undefined, message: string): Promise<void> {
  const target = chatId?.trim() || ADMIN_CHAT_ID;
  await send(target, message);
}

export async function notifyProAndMaybeAdmin(
  proChatId: string | null | undefined,
  message: string
): Promise<void> {
  if (proChatId) {
    await send(proChatId, message);
  }

  if (!ADMIN_CHAT_ID) return;
  const settings = await prisma.settings.upsert({
    where:  { id: "singleton" },
    update: {},
    create: { id: "singleton", adminNotifyAll: true },
  });
  if (settings.adminNotifyAll) {
    await send(ADMIN_CHAT_ID, message);
  }
}
