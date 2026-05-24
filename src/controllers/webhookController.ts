import { Request, Response } from "express";
import prisma from "../config/database";

// ─── POST /api/webhook/call-click ─────────────────────────────────────────────
// Called by the landing page frontend when a visitor taps "call now".
// Logs the attempt so the pro can see who called and when.
export const logCallClick = async (req: Request, res: Response): Promise<void> => {
  const callerPhone      = (req.body.callerPhone ?? "") as string;
  const destinationPhone = (req.body.destinationPhone ?? "") as string;
  const landingPageId    = (req.body.landingPageId ?? "") as string;

  try {
    // Look up pro via landing page id (preferred) or destination phone
    const landingPage = landingPageId
      ? await prisma.landingPage.findUnique({
          where: { id: landingPageId },
          include: { pro: { select: { id: true } } },
        })
      : await prisma.landingPage.findFirst({
          where: { twilioNumber: destinationPhone },
          include: { pro: { select: { id: true } } },
        });

    const proId = landingPage?.pro?.id ?? null;

    await prisma.call.create({
      data: {
        callerPhone,
        destinationPhone,
        duration: 0,
        status: "initiated",
        recordingUrl: null,
        proId,
      },
    });

    console.log(`[call-click] ${callerPhone} → ${destinationPhone} | proId: ${proId ?? "unknown"}`);
    res.status(201).json({ message: "שיחה נרשמה" });
  } catch (error) {
    console.error("[call-click] שגיאה:", error);
    res.status(500).json({ message: "שגיאת שרת" });
  }
};

// ─── TWILIO — מושבת ────────────────────────────────────────────────────────────
// להפעלה מחדש: בטל הערה והחלף את logCallClick בנתיבים למטה.
//
// import { sendSMS, toE164 } from "../services/smsService";
//
// const ADMIN_FALLBACK_PHONE = process.env.ADMIN_FALLBACK_PHONE ?? "";
// const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
//
// function buildTwiML(dialTo: string, callerPhone: string, statusCallbackUrl: string): string {
//   return [
//     '<?xml version="1.0" encoding="UTF-8"?>',
//     "<Response>",
//     `  <Dial record="record-from-answer"`,
//     `        action="${statusCallbackUrl}"`,
//     `        callerId="${callerPhone}">`,
//     `    <Number>${dialTo}</Number>`,
//     "  </Dial>",
//     "</Response>",
//   ].join("\n");
// }
//
// function errorTwiML(message = "השירות אינו זמין כרגע."): string {
//   return [
//     '<?xml version="1.0" encoding="UTF-8"?>',
//     "<Response>",
//     `  <Say language="he-IL">${message}</Say>`,
//     "</Response>",
//   ].join("\n");
// }
//
// // POST /api/webhook/call — Twilio routing webhook (TwiML)
// export const handleIncomingCall = async (req: Request, res: Response): Promise<void> => {
//   const callerPhone  = (req.body.From ?? req.body.callerPhone ?? "") as string;
//   const twilioNumber = (req.body.To ?? req.body.destinationPhone ?? "") as string;
//   res.type("text/xml");
//   if (!callerPhone || !twilioNumber) { res.send(errorTwiML()); return; }
//   try {
//     const landingPage = await prisma.landingPage.findFirst({
//       where: { twilioNumber },
//       include: { pro: { select: { id: true, phone: true, firstName: true, isActive: true } } },
//     });
//     const statusCallbackUrl = `${APP_URL}/api/webhook/call/status`;
//     const activePhone = landingPage?.pro?.isActive ? landingPage.pro.phone : ADMIN_FALLBACK_PHONE;
//     if (!activePhone) { res.send(errorTwiML()); return; }
//     res.send(buildTwiML(toE164(activePhone), callerPhone, statusCallbackUrl));
//   } catch (error) {
//     console.error("[webhook/call]", error);
//     res.send(errorTwiML());
//   }
// };
//
// // POST /api/webhook/call/status — Twilio post-call callback
// export const handleCallStatus = async (req: Request, res: Response): Promise<void> => {
//   const callerPhone  = (req.body.From ?? "") as string;
//   const twilioNumber = (req.body.To ?? "") as string;
//   const callStatus   = (req.body.DialCallStatus ?? req.body.CallStatus ?? "unknown") as string;
//   const duration     = parseInt(req.body.DialCallDuration ?? req.body.CallDuration ?? "0", 10);
//   const recordingUrl = (req.body.RecordingUrl ?? null) as string | null;
//   res.type("text/xml").send('<?xml version="1.0" encoding="UTF-8"?><Response/>');
//   try {
//     const landingPage = await prisma.landingPage.findFirst({
//       where: { twilioNumber },
//       include: { pro: { select: { id: true, phone: true, firstName: true, isActive: true } } },
//     });
//     const pro = landingPage?.pro?.isActive ? landingPage.pro : null;
//     await prisma.call.create({
//       data: { callerPhone, destinationPhone: twilioNumber, duration: isNaN(duration) ? 0 : duration,
//               status: callStatus, recordingUrl, proId: pro?.id ?? null },
//     });
//     if (pro && (callStatus === "no-answer" || callStatus === "busy" || callStatus === "failed")) {
//       await sendSMS(pro.phone, `שלום ${pro.firstName}, שיחה שלא נענתה מ-${callerPhone}.`);
//     }
//   } catch (error) {
//     console.error("[webhook/call/status]", error);
//   }
// };
