import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// ─── Security & Logging ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan("[:date[iso]] :method :url :status - :response-time ms"));
app.use(express.json());

// ─── Rate limiting ────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, slow down." },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── JWT verification middleware ──────────────────────────────
// Applied to all routes except /api/auth/*
const verifyToken = (req: any, res: any, next: any) => {
  // Auth routes don't need a token — let them through
  if (req.path.startsWith("/api/auth")) return next();

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Forward decoded user info downstream as a header
    req.headers["x-user"] = JSON.stringify(decoded);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

app.use(verifyToken);

// ─── Health ───────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, service: "gateway", uptime: process.uptime(), timestamp: new Date() });
});

// ─── Proxy routes ─────────────────────────────────────────────

// Auth service  →  :3001
app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`,
}));

// Extinguisher service  →  :3002
app.use("/api/extinguishers", proxy(process.env.EXTINGUISHER_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/extinguishers${req.url}`,
}));

// Admin service  →  :3003
app.use("/api/admin", proxy(process.env.ADMIN_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/admin${req.url}`,
}));

// Report service  →  :3004
app.use("/api/reports", proxy(process.env.REPORT_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/reports${req.url}`,
}));

// ─── 404 fallback ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT}`);
  console.log(`  → auth-service      : ${process.env.AUTH_SERVICE_URL}`);
  console.log(`  → extinguisher-service: ${process.env.EXTINGUISHER_SERVICE_URL}`);
  console.log(`  → admin-service     : ${process.env.ADMIN_SERVICE_URL}`);
  console.log(`  → report-service    : ${process.env.REPORT_SERVICE_URL}`);
});
