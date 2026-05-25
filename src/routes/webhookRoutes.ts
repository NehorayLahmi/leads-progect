import { Router } from "express";
import { logCallClick } from "../controllers/webhookController";

const router = Router();

router.post("/call-click", logCallClick);

export default router;
