import cron from "node-cron";

import FireExtinguisher from "../models/FireExtinguisher";

import {
  sendExpiryWarningEmail,
  sendExpiredNotificationEmail,
  sendPoliceEscalationEmail,
  sendPoliceNotificationEmail,
} from "./emailService";

export const startCronJobs = () => {
  // Runs every minute to keep statuses in sync in real-time
  cron.schedule("* * * * *", async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running fire extinguisher status checks...`);

      const now = new Date();

      // End of tomorrow — upper bound for upcoming-expiry warning
      const endOfTomorrow = new Date();
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
      endOfTomorrow.setHours(23, 59, 59, 999);

      // =========================
      // JOB 1 — runs FIRST
      // Expiry Warning (to owner)
      // Catches: active units expiring today or tomorrow
      // that have never been alerted yet.
      // Must run BEFORE Job 3 so status is still "active".
      // =========================

      const expiring = await FireExtinguisher.find({
        status: "active",
        alertSentAt: null,
        expirationDate: { $lte: endOfTomorrow },
      });

      for (const ext of expiring) {
        console.log(`[JOB 1] Sending expiry warning to ${ext.ownerName} (${ext.extinguisherId})`);
        await sendExpiryWarningEmail(ext);
        ext.alertSentAt = new Date();
        await ext.save();
      }

      // =========================
      // JOB 2 — runs SECOND
      // Police Escalation
      // Catches: still-active units whose alert was sent
      // 3+ days ago and have not been police-notified yet.
      // Must run BEFORE Job 3 for the same reason.
      // =========================

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const overdue = await FireExtinguisher.find({
        status: "active",
        alertSentAt: { $lte: threeDaysAgo },
        policeNotifiedAt: null,
      });

      for (const ext of overdue) {
        console.log(`[JOB 2] Escalating to police for ${ext.ownerName} (${ext.extinguisherId})`);
        await sendPoliceEscalationEmail(ext);
        await sendPoliceNotificationEmail(ext);
        ext.status = "police_notified";
        ext.policeNotifiedAt = new Date();
        await ext.save();
      }

      // =========================
      // JOB 3 — runs THIRD
      // Auto Mark Expired
      // Flips any active unit whose expirationDate has
      // passed to "expired", then immediately notifies
      // the owner + admin + inspector about each one.
      // =========================

      const justExpired = await FireExtinguisher.find({
        status: "active",
        expirationDate: { $lt: now },
      });

      for (const ext of justExpired) {
        console.log(`[JOB 3] Marking expired and notifying for ${ext.ownerName} (${ext.extinguisherId})`);
        ext.status = "expired";
        // Stamp alertSentAt if it wasn't set during Job 1
        // so the 3-day escalation timer starts from now
        if (!ext.alertSentAt) {
          ext.alertSentAt = new Date();
        }
        await ext.save();
        // Notify owner + staff about the status flip
        await sendExpiredNotificationEmail(ext);
      }

      // =========================
      // JOB 4 — runs FOURTH
      // Re-notify Already-Expired
      // Catches: units already in "expired" status
      // whose reminderSentAt is null — meaning they
      // expired before this system was in place or
      // slipped through Job 3.
      // Guard: reminderSentAt prevents repeat spam.
      // =========================

      const alreadyExpired = await FireExtinguisher.find({
        status: "expired",
        reminderSentAt: null,
      });

      for (const ext of alreadyExpired) {
        console.log(`[JOB 4] Re-notifying already-expired ${ext.ownerName} (${ext.extinguisherId})`);
        await sendExpiredNotificationEmail(ext);
        ext.reminderSentAt = new Date();
        // Start escalation timer if it was never set
        if (!ext.alertSentAt) {
          ext.alertSentAt = new Date();
        }
        await ext.save();
      }

      console.log(`[${new Date().toISOString()}] Status checks completed — warned: ${expiring.length}, escalated: ${overdue.length}, expired: ${justExpired.length + alreadyExpired.length}`);
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};
