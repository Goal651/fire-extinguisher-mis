import express from "express";
import dotenv from "dotenv";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import swaggerUi from "swagger-ui-express";
import { connectDB } from "./config/db";
import { swaggerSpec } from "./config/swagger";

import authRoutes from "./routes/authRoutes";
import extinguisherRoutes from "./routes/extinguisherRoutes";

import { startCronJobs } from "./services/cronService";

import { errorHandler } from "./middleware/errorMiddleware";
import { rateLimiter } from "./middleware/rateLimit";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();

// Enhanced logging with timestamps and file logging
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms",
    {
      stream: {
        write: (message) => {
          const parts = message.trim().split(" ");
          const method = parts[1];
          const url = parts[2];
          const status = parseInt(parts[3]);
          const contentLength = parts[4];
          const responseTime = parts[parts.length - 2];
          logger.http(method, url, status, responseTime, contentLength);
        },
      },
    },
  ),
);

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Apply rate limiting to all routes
app.use(rateLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fire Extinguisher Management API",
    documentation: "/api-docs",
  });
});

app.get("/health", (req, res) => {
  return res.json({
    success: true,
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);

app.use("/api/extinguishers", extinguisherRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    startCronJobs();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

startServer();
