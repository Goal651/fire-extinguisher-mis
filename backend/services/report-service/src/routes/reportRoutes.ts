import { Router } from "express";
import {
  getStockReport,
  getInspectionReport,
  getExpiredReport,
  getMaintenanceReport,
  getSummaryReport,
} from "../controllers/reportController";
import { protect } from "../../shared/middleware/authMiddleware";
import { authorize } from "../../shared/middleware/roleMiddleware";

const router = Router();

// All report endpoints require authentication.
// Admin and Inspector can access all reports.
// (adjust authorize() calls below if you want users to see their own slice too)
router.use(protect);
router.use(authorize("admin", "inspector"));

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get a combined summary of all reports in one call
 *     description: Returns stock totals, inspection status, expired counts, and maintenance breakdown. Best for dashboard overview widgets.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *           default: monthly
 *         description: Bucketing period for trend data. daily=last 30 days, monthly=last 12 months, yearly=last 5 years
 *     responses:
 *       200:
 *         description: Summary report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                   example: monthly
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: object
 *                   properties:
 *                     stock:
 *                       $ref: '#/components/schemas/StockReportData'
 *                     inspections:
 *                       $ref: '#/components/schemas/InspectionReportData'
 *                     expired:
 *                       $ref: '#/components/schemas/ExpiredSummaryData'
 *                     maintenance:
 *                       $ref: '#/components/schemas/MaintenanceSummaryData'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/summary", getSummaryReport);

/**
 * @swagger
 * /api/reports/stock:
 *   get:
 *     summary: Get total extinguisher stock report with trend data
 *     description: Returns total count, status breakdown (active/expired/reported/police_notified), and a time-series trend of registrations bucketed by the requested period.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *           default: monthly
 *         description: Bucketing period for trend data
 *     responses:
 *       200:
 *         description: Stock report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                   example: monthly
 *                 data:
 *                   $ref: '#/components/schemas/StockReportData'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stock", getStockReport);

/**
 * @swagger
 * /api/reports/inspections:
 *   get:
 *     summary: Get inspection status and result report
 *     description: Returns extinguisher-level inspection status breakdown (none/pending/completed), log-level result breakdown (pass/fail), pass rate percentage, and trend data.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *           default: monthly
 *         description: Bucketing period for trend data
 *     responses:
 *       200:
 *         description: Inspection report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                   example: monthly
 *                 data:
 *                   $ref: '#/components/schemas/InspectionReportData'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/inspections", getInspectionReport);

/**
 * @swagger
 * /api/reports/expired:
 *   get:
 *     summary: Get expired extinguishers report
 *     description: Returns total expired count, police-notified count, expiry trend, and full record list with days-since-expiry for each item.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *           default: monthly
 *         description: Bucketing period for trend data
 *     responses:
 *       200:
 *         description: Expired report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                   example: monthly
 *                 data:
 *                   $ref: '#/components/schemas/ExpiredReportData'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/expired", getExpiredReport);

/**
 * @swagger
 * /api/reports/maintenance:
 *   get:
 *     summary: Get maintenance history report
 *     description: Returns maintenance status breakdown (none/scheduled/completed), trend data, and full list of extinguishers that have scheduled or completed maintenance.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *           default: monthly
 *         description: Bucketing period for trend data
 *     responses:
 *       200:
 *         description: Maintenance report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                   example: monthly
 *                 data:
 *                   $ref: '#/components/schemas/MaintenanceReportData'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/maintenance", getMaintenanceReport);

export default router;
