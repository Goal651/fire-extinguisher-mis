import { Request, Response } from "express";
import FireExtinguisher from "../models/FireExtinguisher";
import type { Period } from "../types/reports";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Returns the MongoDB $dateToString format string and a JS label formatter
 * for the requested period.
 */
function getPeriodFormat(period: Period): {
  mongoFormat: string;
  labelFromDate: (d: Date) => string;
} {
  switch (period) {
    case "daily":
      return {
        mongoFormat: "%Y-%m-%d",
        labelFromDate: (d) => d.toISOString().slice(0, 10),
      };
    case "monthly":
      return {
        mongoFormat: "%Y-%m",
        labelFromDate: (d) => d.toISOString().slice(0, 7),
      };
    case "yearly":
    default:
      return {
        mongoFormat: "%Y",
        labelFromDate: (d) => String(d.getFullYear()),
      };
  }
}

/**
 * Returns the date range for the requested period window.
 * daily   → last 30 days
 * monthly → last 12 months
 * yearly  → last 5 years
 */
function getDateRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  switch (period) {
    case "daily":
      from.setDate(from.getDate() - 29);
      break;
    case "monthly":
      from.setMonth(from.getMonth() - 11);
      break;
    case "yearly":
    default:
      from.setFullYear(from.getFullYear() - 4);
  }

  from.setHours(0, 0, 0, 0);
  return { from, to };
}

function parsePeriod(raw: unknown): Period {
  if (raw === "daily" || raw === "monthly" || raw === "yearly") return raw;
  return "monthly";
}

// ─────────────────────────────────────────────────────────────
// 1. Stock Report
// GET /api/reports/stock?period=daily|monthly|yearly
// ─────────────────────────────────────────────────────────────

export const getStockReport = async (req: Request, res: Response) => {
  try {
    const period = parsePeriod(req.query.period);
    const { from, to } = getDateRange(period);
    const { mongoFormat } = getPeriodFormat(period);

    // Status breakdown (all time totals)
    const [total, active, expired, reported, police_notified] =
      await Promise.all([
        FireExtinguisher.countDocuments(),
        FireExtinguisher.countDocuments({ status: "active" }),
        FireExtinguisher.countDocuments({ status: "expired" }),
        FireExtinguisher.countDocuments({ status: "reported" }),
        FireExtinguisher.countDocuments({ status: "police_notified" }),
      ]);

    // Trend: number of extinguishers registered per bucket
    const trendRaw: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: {
              $dateToString: { format: mongoFormat, date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    return res.json({
      success: true,
      period,
      data: {
        total,
        breakdown: { active, expired, reported, police_notified },
        trend: trendRaw.map((b) => ({ label: b._id, count: b.count })),
      },
    });
  } catch (error) {
    console.error("Stock report error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate stock report" });
  }
};

// ─────────────────────────────────────────────────────────────
// 2. Inspection Status Report
// GET /api/reports/inspections?period=daily|monthly|yearly
// ─────────────────────────────────────────────────────────────

export const getInspectionReport = async (req: Request, res: Response) => {
  try {
    const period = parsePeriod(req.query.period);
    const { from, to } = getDateRange(period);
    const { mongoFormat } = getPeriodFormat(period);

    // Inspection status breakdown on the extinguisher level
    const [none, pending, completed] = await Promise.all([
      FireExtinguisher.countDocuments({ inspectionStatus: "none" }),
      FireExtinguisher.countDocuments({ inspectionStatus: "pending" }),
      FireExtinguisher.countDocuments({ inspectionStatus: "completed" }),
    ]);

    // Flatten inspectionLogs across all docs for result analysis
    const logStats: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        { $unwind: "$inspectionLogs" },
        {
          $group: {
            _id: "$inspectionLogs.result",
            count: { $sum: 1 },
          },
        },
      ]);

    const pass = logStats.find((l) => l._id === "pass")?.count ?? 0;
    const fail = logStats.find((l) => l._id === "fail")?.count ?? 0;
    const totalLogs = pass + fail;
    const passRate =
      totalLogs > 0 ? Math.round((pass / totalLogs) * 10000) / 100 : 0;

    // Trend: inspections logged per period bucket
    const trendRaw: { _id: string; pass: number; fail: number }[] =
      await FireExtinguisher.aggregate([
        { $unwind: "$inspectionLogs" },
        {
          $match: {
            "inspectionLogs.inspectedAt": { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: mongoFormat,
                date: "$inspectionLogs.inspectedAt",
              },
            },
            pass: {
              $sum: { $cond: [{ $eq: ["$inspectionLogs.result", "pass"] }, 1, 0] },
            },
            fail: {
              $sum: { $cond: [{ $eq: ["$inspectionLogs.result", "fail"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    return res.json({
      success: true,
      period,
      data: {
        totalInspectionsLogged: totalLogs,
        statusBreakdown: { none, pending, completed },
        resultBreakdown: { pass, fail },
        passRate,
        trend: trendRaw.map((b) => ({
          label: b._id,
          count: b.pass + b.fail,
          pass: b.pass,
          fail: b.fail,
        })),
      },
    });
  } catch (error) {
    console.error("Inspection report error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate inspection report" });
  }
};

// ─────────────────────────────────────────────────────────────
// 3. Expired Extinguishers Report
// GET /api/reports/expired?period=daily|monthly|yearly
// ─────────────────────────────────────────────────────────────

export const getExpiredReport = async (req: Request, res: Response) => {
  try {
    const period = parsePeriod(req.query.period);
    const { from, to } = getDateRange(period);
    const { mongoFormat } = getPeriodFormat(period);
    const now = new Date();

    const [total, policeNotifiedCount] = await Promise.all([
      FireExtinguisher.countDocuments({
        status: { $in: ["expired", "reported", "police_notified"] },
      }),
      FireExtinguisher.countDocuments({ status: "police_notified" }),
    ]);

    // Trend: how many expired per period bucket (by expirationDate)
    const trendRaw: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        {
          $match: {
            status: { $in: ["expired", "reported", "police_notified"] },
            expirationDate: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: mongoFormat, date: "$expirationDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    // Full record list
    const records = await FireExtinguisher.find({
      status: { $in: ["expired", "reported", "police_notified"] },
    })
      .sort({ expirationDate: 1 })
      .lean();

    const mappedRecords = records.map((r) => ({
      _id: r._id.toString(),
      extinguisherId: r.extinguisherId,
      ownerName: r.ownerName,
      ownerEmail: r.ownerEmail,
      ownerPhone: r.ownerPhone,
      expirationDate: r.expirationDate.toISOString(),
      status: r.status,
      daysSinceExpiry: Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(r.expirationDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
      policeNotified: r.status === "police_notified",
      policeNotifiedAt: r.policeNotifiedAt
        ? new Date(r.policeNotifiedAt).toISOString()
        : null,
    }));

    return res.json({
      success: true,
      period,
      data: {
        total,
        policeNotifiedCount,
        trend: trendRaw.map((b) => ({ label: b._id, count: b.count })),
        records: mappedRecords,
      },
    });
  } catch (error) {
    console.error("Expired report error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate expired report" });
  }
};

// ─────────────────────────────────────────────────────────────
// 4. Maintenance History Report
// GET /api/reports/maintenance?period=daily|monthly|yearly
// ─────────────────────────────────────────────────────────────

export const getMaintenanceReport = async (req: Request, res: Response) => {
  try {
    const period = parsePeriod(req.query.period);
    const { from, to } = getDateRange(period);
    const { mongoFormat } = getPeriodFormat(period);

    const [none, scheduled, completed] = await Promise.all([
      FireExtinguisher.countDocuments({ maintenanceStatus: "none" }),
      FireExtinguisher.countDocuments({ maintenanceStatus: "scheduled" }),
      FireExtinguisher.countDocuments({ maintenanceStatus: "completed" }),
    ]);

    // Trend: maintenance scheduled per period bucket
    const trendRaw: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        {
          $match: {
            maintenanceStatus: { $in: ["scheduled", "completed"] },
            scheduledMaintenanceDate: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: mongoFormat,
                date: "$scheduledMaintenanceDate",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    // Records that have maintenance history
    const records = await FireExtinguisher.find({
      maintenanceStatus: { $in: ["scheduled", "completed"] },
    })
      .sort({ scheduledMaintenanceDate: -1 })
      .lean();

    const mappedRecords = records.map((r) => ({
      _id: r._id.toString(),
      extinguisherId: r.extinguisherId,
      ownerName: r.ownerName,
      scheduledMaintenanceDate: r.scheduledMaintenanceDate
        ? new Date(r.scheduledMaintenanceDate).toISOString()
        : null,
      maintenanceStatus: r.maintenanceStatus ?? "none",
      maintenanceNotes: r.maintenanceNotes ?? null,
      updatedAt: r.updatedAt.toISOString(),
    }));

    return res.json({
      success: true,
      period,
      data: {
        statusBreakdown: { none, scheduled, completed },
        trend: trendRaw.map((b) => ({ label: b._id, count: b.count })),
        records: mappedRecords,
      },
    });
  } catch (error) {
    console.error("Maintenance report error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate maintenance report" });
  }
};

// ─────────────────────────────────────────────────────────────
// 5. Summary Report  (all four in one request)
// GET /api/reports/summary?period=daily|monthly|yearly
// ─────────────────────────────────────────────────────────────

export const getSummaryReport = async (req: Request, res: Response) => {
  try {
    const period = parsePeriod(req.query.period);
    const { from, to } = getDateRange(period);
    const { mongoFormat } = getPeriodFormat(period);
    const now = new Date();

    // ── Stock ──────────────────────────────────────────
    const [total, active, expired, reported, police_notified] =
      await Promise.all([
        FireExtinguisher.countDocuments(),
        FireExtinguisher.countDocuments({ status: "active" }),
        FireExtinguisher.countDocuments({ status: "expired" }),
        FireExtinguisher.countDocuments({ status: "reported" }),
        FireExtinguisher.countDocuments({ status: "police_notified" }),
      ]);

    const stockTrendRaw: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: mongoFormat, date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    // ── Inspections ───────────────────────────────────
    const [inspNone, inspPending, inspCompleted] = await Promise.all([
      FireExtinguisher.countDocuments({ inspectionStatus: "none" }),
      FireExtinguisher.countDocuments({ inspectionStatus: "pending" }),
      FireExtinguisher.countDocuments({ inspectionStatus: "completed" }),
    ]);

    const logStats: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        { $unwind: "$inspectionLogs" },
        { $group: { _id: "$inspectionLogs.result", count: { $sum: 1 } } },
      ]);
    const pass = logStats.find((l) => l._id === "pass")?.count ?? 0;
    const fail = logStats.find((l) => l._id === "fail")?.count ?? 0;
    const totalLogs = pass + fail;
    const passRate =
      totalLogs > 0 ? Math.round((pass / totalLogs) * 10000) / 100 : 0;

    const inspTrendRaw: { _id: string; pass: number; fail: number }[] =
      await FireExtinguisher.aggregate([
        { $unwind: "$inspectionLogs" },
        { $match: { "inspectionLogs.inspectedAt": { $gte: from, $lte: to } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: mongoFormat,
                date: "$inspectionLogs.inspectedAt",
              },
            },
            pass: { $sum: { $cond: [{ $eq: ["$inspectionLogs.result", "pass"] }, 1, 0] } },
            fail: { $sum: { $cond: [{ $eq: ["$inspectionLogs.result", "fail"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    // ── Expired ───────────────────────────────────────
    const expiredTotal = await FireExtinguisher.countDocuments({
      status: { $in: ["expired", "reported", "police_notified"] },
    });

    const expiredTrendRaw: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        {
          $match: {
            status: { $in: ["expired", "reported", "police_notified"] },
            expirationDate: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: mongoFormat, date: "$expirationDate" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    // ── Maintenance ───────────────────────────────────
    const [maintNone, maintScheduled, maintCompleted] = await Promise.all([
      FireExtinguisher.countDocuments({ maintenanceStatus: "none" }),
      FireExtinguisher.countDocuments({ maintenanceStatus: "scheduled" }),
      FireExtinguisher.countDocuments({ maintenanceStatus: "completed" }),
    ]);

    const maintTrendRaw: { _id: string; count: number }[] =
      await FireExtinguisher.aggregate([
        {
          $match: {
            maintenanceStatus: { $in: ["scheduled", "completed"] },
            scheduledMaintenanceDate: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: mongoFormat, date: "$scheduledMaintenanceDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    return res.json({
      success: true,
      period,
      generatedAt: now.toISOString(),
      data: {
        stock: {
          total,
          breakdown: { active, expired, reported, police_notified },
          trend: stockTrendRaw.map((b) => ({ label: b._id, count: b.count })),
        },
        inspections: {
          totalInspectionsLogged: totalLogs,
          statusBreakdown: { none: inspNone, pending: inspPending, completed: inspCompleted },
          resultBreakdown: { pass, fail },
          passRate,
          trend: inspTrendRaw.map((b) => ({
            label: b._id,
            count: b.pass + b.fail,
            pass: b.pass,
            fail: b.fail,
          })),
        },
        expired: {
          total: expiredTotal,
          policeNotifiedCount: police_notified,
          trend: expiredTrendRaw.map((b) => ({ label: b._id, count: b.count })),
        },
        maintenance: {
          statusBreakdown: { none: maintNone, scheduled: maintScheduled, completed: maintCompleted },
          trend: maintTrendRaw.map((b) => ({ label: b._id, count: b.count })),
        },
      },
    });
  } catch (error) {
    console.error("Summary report error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate summary report" });
  }
};
