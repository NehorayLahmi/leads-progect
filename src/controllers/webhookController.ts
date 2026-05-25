import { Request, Response } from "express";
import prisma from "../config/database";
import { sendTelegram } from "../services/telegramService";

// POST /api/webhook/call-click
export const logCallClick = async (req: Request, res: Response): Promise<void> => {
  const callerPhone      = (req.body.callerPhone ?? "") as string;
  const destinationPhone = (req.body.destinationPhone ?? "") as string;
  const landingPageId    = (req.body.landingPageId ?? "") as string;

  try {
    const landingPage = landingPageId
      ? await prisma.landingPage.findUnique({
          where: { id: landingPageId },
          include: { pro: { select: { id: true, telegramChatId: true } } },
        })
      : await prisma.landingPage.findFirst({
          where: { twilioNumber: destinationPhone },
          include: { pro: { select: { id: true, telegramChatId: true } } },
        });

    const pro   = landingPage?.pro ?? null;
    const proId = pro?.id ?? null;

    await prisma.call.create({
      data: { callerPhone, destinationPhone, duration: 0, status: "initiated", recordingUrl: null, proId },
    });

    await sendTelegram(
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
