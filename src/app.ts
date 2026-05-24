import express, { Application, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import router from "./routes";
import cors from "cors";
import { ensureAdminExists } from "./config/bootstrap";
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

app.use("/api", router);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await ensureAdminExists();
});

export default app;
