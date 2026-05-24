import { Router } from "express";
import { logCallClick } from "../controllers/webhookController";

const router = Router();

// Logs a call attempt when a visitor taps "call now" on a landing page
router.post("/call-click", logCallClick);

// ─── TWILIO — מושבת ────────────────────────────────────────────────────────────
// import { handleIncomingCall, handleCallStatus } from "../controllers/webhookController";
// router.post("/call", handleIncomingCall);        // TwiML routing webhook
// router.post("/call/status", handleCallStatus);   // post-call status callback

export default router;
