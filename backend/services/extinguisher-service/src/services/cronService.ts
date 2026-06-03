import cron from "node-cron";
import FireExtinguisher from "../models/FireExtinguisher";
import { publishMessage, QUEUES } from "../../shared/rabbitmq";

export const startCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running fire extinguisher status checks...`);

      const now = new Date();

      const endOfTomorrow = new Date();
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
      endOfTomorrow.setHours(23, 59, 59, 999);

      // =========================
      // JOB 1 — Expiry Warning
      // =========================
      const expiring = await FireExtinguisher.find({
        status: "active",
        alertSentAt: null,
        expirationDate: { $lte: endOfTomorrow },
      });

      for (const ext of expiring) {
        console.log(`[JOB 1] Publishing expiry warning for ${ext.ownerName} (${ext.extinguisherId})`);
        await publishMessage(QUEUES.EXPIRY_WARNING, {
          extinguisherId: ext.extinguisherId,
          ownerName: ext.ownerName,
          ownerEmail: ext.ownerEmail,
          ownerPhone: ext.ownerPhone,
          ownerIdNumber: ext.ownerIdNumber,
          expirationDate: ext.expirationDate.toISOString(),
        });
        ext.alertSentAt = new Date();
        await ext.save();
      }

      // =========================
      // JOB 2 — Police Escalation
      // =========================
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const overdue = await FireExtinguisher.find({
        status: "active",
        alertSentAt: { $lte: threeDaysAgo },
        policeNotifiedAt: null,
      });

      for (const ext of overdue) {
        console.log(`[JOB 2] Publishing police escalation for ${ext.ownerName} (${ext.extinguisherId})`);
        await publishMessage(QUEUES.POLICE_ESCALATION, {
          extinguisherId: ext.extinguisherId,
          ownerName: ext.ownerName,
          ownerEmail: ext.ownerEmail,
          ownerPhone: ext.ownerPhone,
          ownerIdNumber: ext.ownerIdNumber,
          expirationDate: ext.expirationDate.toISOString(),
          alertSentAt: ext.alertSentAt?.toISOString() ?? null,
        });
        ext.status = "police_notified";
        ext.policeNotifiedAt = new Date();
        await ext.save();
      }

      // =========================
      // JOB 3 — Auto Mark Expired
      // =========================
      const justExpired = await FireExtinguisher.find({
        status: "active",
        expirationDate: { $lt: now },
      });

      for (const ext of justExpired) {
        console.log(`[JOB 3] Marking expired, publishing notification for ${ext.ownerName} (${ext.extinguisherId})`);
        ext.status = "expired";
        if (!ext.alertSentAt) ext.alertSentAt = new Date();
        await ext.save();
        await publishMessage(QUEUES.EXPIRED, {
          extinguisherId: ext.extinguisherId,
          ownerName: ext.ownerName,
          ownerEmail: ext.ownerEmail,
          ownerPhone: ext.ownerPhone,
          ownerIdNumber: ext.ownerIdNumber,
          expirationDate: ext.expirationDate.toISOString(),
        });
      }

      // =========================
      // JOB 4 — Re-notify Already Expired
      // =========================
      const alreadyExpired = await FireExtinguisher.find({
        status: "expired",
        reminderSentAt: null,
      });

      for (const ext of alreadyExpired) {
        console.log(`[JOB 4] Publishing already-expired notification for ${ext.ownerName} (${ext.extinguisherId})`);
        await publishMessage(QUEUES.ALREADY_EXPIRED, {
          extinguisherId: ext.extinguisherId,
          ownerName: ext.ownerName,
          ownerEmail: ext.ownerEmail,
          ownerPhone: ext.ownerPhone,
          ownerIdNumber: ext.ownerIdNumber,
          expirationDate: ext.expirationDate.toISOString(),
        });
        ext.reminderSentAt = new Date();
        if (!ext.alertSentAt) ext.alertSentAt = new Date();
        await ext.save();
      }

      console.log(`[${new Date().toISOString()}] Done — warned:${expiring.length} escalated:${overdue.length} expired:${justExpired.length} re-notified:${alreadyExpired.length}`);
    } catch (err) {
      console.error("[CronService] Error:", err);
    }
  });
};
