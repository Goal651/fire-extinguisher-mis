import { FireExtinguisher } from "@/types";

const DAYS = (n: number) => n * 24 * 60 * 60 * 1000;
const now = () => new Date();

/**
 * Inspector should log an inspection when:
 * - Extinguisher is active
 * - AND one of:
 *   a) inspectionStatus is "none" or "pending"
 *   b) inspectionStatus is "completed" but last inspection was >30 days ago
 *   c) scheduled inspection date has already passed
 */
export function shouldShowInspectForm(ext: FireExtinguisher): boolean {
  if (ext.status !== "active") return false;

  const status = ext.inspectionStatus ?? "none";

  if (status === "none" || status === "pending") return true;

  if (status === "completed") {
    const lastLog = ext.inspectionLogs?.[ext.inspectionLogs.length - 1];
    if (lastLog) {
      const daysSince =
        (now().getTime() - new Date(lastLog.inspectedAt).getTime()) / DAYS(1);
      if (daysSince > 30) return true;
    } else {
      // completed status but no logs — show form
      return true;
    }
  }

  // If a scheduled inspection date has passed, it's overdue
  if (ext.scheduledInspectionDate) {
    const scheduled = new Date(ext.scheduledInspectionDate);
    if (scheduled <= now()) return true;
  }

  return false;
}

/**
 * Inspector should schedule maintenance when:
 * - Extinguisher is active
 * - AND one of:
 *   a) maintenanceStatus is "none"
 *   b) maintenanceStatus is "completed" (due for next cycle)
 *   c) scheduled maintenance date has already passed (overdue)
 */
export function shouldShowMaintenanceForm(ext: FireExtinguisher): boolean {
  if (ext.status !== "active") return false;

  const status = ext.maintenanceStatus ?? "none";

  if (status === "none" || status === "completed") return true;

  if (status === "scheduled" && ext.scheduledMaintenanceDate) {
    const scheduled = new Date(ext.scheduledMaintenanceDate);
    // Overdue — scheduled date passed but maintenance wasn't completed
    if (scheduled < now()) return true;
  }

  return false;
}

/**
 * User can request an inspection when:
 * - Extinguisher is active
 * - AND inspectionStatus is NOT "pending" (request not already queued)
 */
export function shouldShowScheduleInspectionForm(
  ext: FireExtinguisher
): boolean {
  if (ext.status !== "active") return false;
  return ext.inspectionStatus !== "pending";
}

/**
 * Returns a human-readable reason why an action is blocked, for inline hints.
 */
export function getInspectBlockedReason(ext: FireExtinguisher): string | null {
  if (ext.status !== "active")
    return `Inspection not applicable — extinguisher is ${ext.status.replace("_", " ")}.`;

  const status = ext.inspectionStatus ?? "none";
  if (status === "completed") {
    const lastLog = ext.inspectionLogs?.[ext.inspectionLogs.length - 1];
    if (lastLog) {
      const daysSince = Math.floor(
        (now().getTime() - new Date(lastLog.inspectedAt).getTime()) / DAYS(1)
      );
      if (daysSince <= 30)
        return `Last inspection was ${daysSince} day${daysSince === 1 ? "" : "s"} ago. No action needed yet.`;
    }
  }
  return null;
}

export function getMaintenanceBlockedReason(
  ext: FireExtinguisher
): string | null {
  if (ext.status !== "active")
    return `Maintenance not applicable — extinguisher is ${ext.status.replace("_", " ")}.`;

  if (ext.maintenanceStatus === "scheduled" && ext.scheduledMaintenanceDate) {
    const scheduled = new Date(ext.scheduledMaintenanceDate);
    if (scheduled >= now()) {
      return `Maintenance already scheduled for ${scheduled.toLocaleDateString()}.`;
    }
  }
  return null;
}

export function getScheduleInspectionBlockedReason(
  ext: FireExtinguisher
): string | null {
  if (ext.status !== "active")
    return `Cannot request inspection — extinguisher is ${ext.status.replace("_", " ")}.`;

  if (ext.inspectionStatus === "pending") {
    const date = ext.scheduledInspectionDate
      ? ` on ${new Date(ext.scheduledInspectionDate).toLocaleDateString()}`
      : "";
    return `An inspection is already scheduled${date}. No need to request again.`;
  }
  return null;
}
