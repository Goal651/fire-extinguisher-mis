import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "../../shared/config/db";
import reportRoutes from "./routes/reportRoutes";
import { errorHandler } from "../../shared/middleware/errorMiddleware";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan("[:date[iso]] :method :url :status - :response-time ms"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "report-service", uptime: process.uptime() });
});

app.use("/api/reports", reportRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3004;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`[report-service] Running on port ${PORT}`));
};

start().catch((err) => { console.error(err); process.exit(1); });
