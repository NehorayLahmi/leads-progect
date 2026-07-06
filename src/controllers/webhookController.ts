import { Request, Response } from "express";
import prisma from "../config/database";
import { notifyProAndMaybeAdmin } from "../services/telegramService";

async function resolvePro(landingPageId: string, destinationPhone: string) {
  const landingPage = landingPageId
    ? await prisma.landingPage.findUnique({
        where: { id: landingPageId },
        include: { pro: { select: { id: true, telegramChatId: true, isActive: true } } },
      })
    : await prisma.landingPage.findFirst({
        where: { twilioNumber: destinationPhone },
        include: { pro: { select: { id: true, telegramChatId: true, isActive: true } } },
      });
  const pro = (landingPage?.pro?.isActive ? landingPage.pro : null) ?? null;
  return { pro, proId: pro?.id ?? null };
}

// POST /api/webhook/call-click
export const logCallClick = async (req: Request, res: Response): Promise<void> => {
  const callerPhone      = (req.body.callerPhone ?? "") as string;
  const destinationPhone = (req.body.destinationPhone ?? "") as string;
  const landingPageId    = (req.body.landingPageId ?? "") as string;

  try {
    const { pro, proId } = await resolvePro(landingPageId, destinationPhone);

    await prisma.call.create({
      data: { callerPhone, destinationPhone, duration: 0, status: "initiated", recordingUrl: null, type: "PHONE", proId },
    });

    await notifyProAndMaybeAdmin(
      pro?.telegramChatId,
      `📞 <b>שיחה נכנסת!</b>\n📱 מתקשר: ${callerPhone || "לא ידוע"}\n☎️ יעד: ${destinationPhone}`
    );

    console.log(`[call-click] ${callerPhone} → ${destinationPhone} | proId: ${proId ?? "unknown"}`);
    res.status(201).json({ message: "שיחה נרשמה" });
  } catch (error) {
    console.error("[call-click] שגיאה:", error);
    res.status(500).json({ message: "שגיאת שרת" });
  }
};

// POST /api/webhook/whatsapp-click
export const logWhatsAppClick = async (req: Request, res: Response): Promise<void> => {
  const destinationPhone = (req.body.destinationPhone ?? "") as string;
  const landingPageId    = (req.body.landingPageId ?? "") as string;

  try {
    const { pro, proId } = await resolvePro(landingPageId, destinationPhone);

    await prisma.call.create({
      data: { callerPhone: "", destinationPhone, duration: 0, status: "initiated", recordingUrl: null, type: "WHATSAPP", proId },
    });

    await notifyProAndMaybeAdmin(
      pro?.telegramChatId,
      `💬 <b>קליק WhatsApp!</b>\n📱 מספר יעד: ${destinationPhone}`
    );

    console.log(`[whatsapp-click] → ${destinationPhone} | proId: ${proId ?? "unknown"}`);
    res.status(201).json({ message: "קליק WhatsApp נרשם" });
  } catch (error) {
    console.error("[whatsapp-click] שגיאה:", error);
    res.status(500).json({ message: "שגיאת שרת" });
  }
};
