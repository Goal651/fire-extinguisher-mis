import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "../shared/config/db";
import extinguisherRoutes from "./routes/extinguisherRoutes";
import { errorHandler } from "../shared/middleware/errorMiddleware";
import { startCronJobs } from "./services/cronService";
import { connectRabbitMQ } from "../shared/rabbitmq";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan("[:date[iso]] :method :url :status - :response-time ms"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "extinguisher-service", uptime: process.uptime() });
});

app.use("/api/extinguishers", extinguisherRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  startCronJobs();
  app.listen(PORT, () => console.log(`[extinguisher-service] Running on port ${PORT}`));
};

start().catch((err) => { console.error(err); process.exit(1); });
