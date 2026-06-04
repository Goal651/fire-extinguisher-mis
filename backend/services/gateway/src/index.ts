import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const app = express();

// ─── Security & Logging ───────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // disabled so Swagger UI loads
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

// ─── Swagger UI (aggregated from all services) ────────────────
// Fetches each service's OpenAPI spec and merges into one UI.
// Specs are fetched lazily on first request so services have time to boot.

const SERVICE_SPECS = [
  { name: "Auth",         url: `${process.env.AUTH_SERVICE_URL}/api-docs/json` },
  { name: "Extinguisher", url: `${process.env.EXTINGUISHER_SERVICE_URL}/api-docs/json` },
  { name: "Admin",        url: `${process.env.ADMIN_SERVICE_URL}/api-docs/json` },
  { name: "Reports",      url: `${process.env.REPORT_SERVICE_URL}/api-docs/json` },
];

async function fetchSpec(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function mergeSpecs(specs: any[]): any {
  const merged: any = {
    openapi: "3.0.0",
    info: {
      title: "Fire Extinguisher MIS — Full API",
      version: "1.0.0",
      description: "Aggregated API documentation for all microservices",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {},
    tags: [],
  };

  for (const spec of specs) {
    if (!spec) continue;
    // Merge paths
    if (spec.paths) Object.assign(merged.paths, spec.paths);
    // Merge component schemas
    if (spec.components?.schemas) {
      merged.components.schemas = {
        ...(merged.components.schemas || {}),
        ...spec.components.schemas,
      };
    }
    // Merge tags
    if (spec.tags) merged.tags.push(...spec.tags);
  }

  return merged;
}

// Serve Swagger UI — fetch and merge specs at request time
app.get("/api-docs/json", async (_req, res) => {
  const specs = await Promise.all(SERVICE_SPECS.map((s) => fetchSpec(s.url)));
  res.json(mergeSpecs(specs));
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/api-docs/json",
    },
  }),
);

// ─── JWT verification middleware ──────────────────────────────
const verifyToken = (req: any, res: any, next: any) => {
  if (req.path.startsWith("/api/auth")) return next();

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
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
app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`,
}));

app.use("/api/extinguishers", proxy(process.env.EXTINGUISHER_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/extinguishers${req.url}`,
}));

app.use("/api/admin", proxy(process.env.ADMIN_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/admin${req.url}`,
}));

app.use("/api/reports", proxy(process.env.REPORT_SERVICE_URL!, {
  proxyReqPathResolver: (req) => `/api/reports${req.url}`,
}));

// ─── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT}`);
  console.log(`  → Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`  → auth-service      : ${process.env.AUTH_SERVICE_URL}`);
  console.log(`  → extinguisher-service: ${process.env.EXTINGUISHER_SERVICE_URL}`);
  console.log(`  → admin-service     : ${process.env.ADMIN_SERVICE_URL}`);
  console.log(`  → report-service    : ${process.env.REPORT_SERVICE_URL}`);
});
