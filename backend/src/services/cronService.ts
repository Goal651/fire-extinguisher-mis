import cron from "node-cron";

import FireExtinguisher from "../models/FireExtinguisher";

import {
  sendExpiryWarningEmail,
  sendPoliceEscalationEmail,
  sendPoliceNotificationEmail,
} from "./emailService";

export const startCronJobs = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("Running fire extinguisher expiry checks...");

      const now = new Date();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // =========================
      // JOB 1
      // 1 Day Expiry Warning
      // =========================

      const expiring = await FireExtinguisher.find({
        status: "active",
        alertSentAt: null,
        expirationDate: {
          $gte: now,
          $lte: tomorrow,
        },
      });

      for (const extinguisher of expiring) {
        await sendExpiryWarningEmail(extinguisher);

        extinguisher.alertSentAt = new Date();

        await extinguisher.save();
      }

      // =========================
      // JOB 2
      // Escalation After 3 Days
      // =========================

      const threeDaysAgo = new Date();

      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const overdue = await FireExtinguisher.find({
        status: "active",
        alertSentAt: {
          $lte: threeDaysAgo,
        },
        policeNotifiedAt: null,
      });

      for (const extinguisher of overdue) {
        await sendPoliceEscalationEmail(extinguisher);

        await sendPoliceNotificationEmail(extinguisher);

        extinguisher.status = "police_notified";

        extinguisher.policeNotifiedAt = new Date();

        await extinguisher.save();
      }

      // =========================
      // JOB 3
      // Auto Mark Expired
      // =========================

      await FireExtinguisher.updateMany(
        {
          expirationDate: {
            $lt: now,
          },
          status: "active",
        },
        {
          status: "expired",
        },
      );

      console.log("Cron jobs completed successfully");
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};
