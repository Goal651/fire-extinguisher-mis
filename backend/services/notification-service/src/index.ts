import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import { connectRabbitMQ, consumeMessages, QUEUES } from "../../shared/rabbitmq";
import {
  sendExpiryWarningEmail,
  sendExpiredNotificationEmail,
  sendPoliceEscalationEmail,
  sendPoliceNotificationEmail,
  ExtinguisherPayload,
} from "./services/emailService";

dotenv.config();

// ─── Minimal HTTP server for health checks ───────────────────
const app = express();
app.use(helmet());
app.use(morgan("[:date[iso]] :method :url :status - :response-time ms"));

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "notification-service", uptime: process.uptime() });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`[notification-service] HTTP health on port ${PORT}`));

// ─── RabbitMQ consumers ───────────────────────────────────────
const startConsumers = async () => {
  await connectRabbitMQ();

  // Queue 1 — expiry warning (owner only)
  await consumeMessages(QUEUES.EXPIRY_WARNING, async (payload: ExtinguisherPayload) => {
    console.log(`[NOTIFY] Expiry warning → ${payload.ownerEmail}`);
    await sendExpiryWarningEmail(payload);
  });

  // Queue 2 — police escalation (owner + admin + police)
  await consumeMessages(QUEUES.POLICE_ESCALATION, async (payload: ExtinguisherPayload) => {
    console.log(`[NOTIFY] Police escalation → ${payload.ownerEmail}`);
    await sendPoliceEscalationEmail(payload);
    await sendPoliceNotificationEmail(payload);
  });

  // Queue 3 — just expired (owner + staff)
  await consumeMessages(QUEUES.EXPIRED, async (payload: ExtinguisherPayload) => {
    console.log(`[NOTIFY] Expired notification → ${payload.ownerEmail}`);
    await sendExpiredNotificationEmail(payload);
  });

  // Queue 4 — already expired re-notification (owner + staff)
  await consumeMessages(QUEUES.ALREADY_EXPIRED, async (payload: ExtinguisherPayload) => {
    console.log(`[NOTIFY] Already-expired re-notification → ${payload.ownerEmail}`);
    await sendExpiredNotificationEmail(payload);
  });

  console.log("[notification-service] Listening on all queues");
};

startConsumers().catch((err) => { console.error(err); process.exit(1); });
