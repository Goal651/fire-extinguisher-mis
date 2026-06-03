import { Router } from "express";
import {
  createExtinguisher,
  getExtinguishers,
  getExtinguisher,
  updateExtinguisher,
  deleteExtinguisher,
  markReported,
  getDashboardStats,
  inspectExtinguisher,
  scheduleMaintenance,
  scheduleInspection,
} from "../controllers/extinguisherController";

import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import { extinguisherRegistrationValidation } from "../validators/extinguisherValidators";

const router = Router();

/**
 * @swagger
 * /api/extinguishers:
 *   post:
 *     summary: Create a new fire extinguisher (admin only)
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExtinguisherRequest'
 *     responses:
 *       201:
 *         description: Extinguisher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FireExtinguisher'
 *       400:
 *         description: Extinguisher ID already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
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
router.post(
  "/",
  protect,
  authorize("admin"),
  extinguisherRegistrationValidation,
  validateRequest,
  createExtinguisher,
);

/**
 * @swagger
 * /api/extinguishers:
 *   get:
 *     summary: Get all fire extinguishers with pagination and filtering
 *     description: Returns all extinguishers for admin/inspector. Regular users see only their own extinguishers.
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, reported, police_notified]
 *         description: Filter by extinguisher status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by owner name or extinguisher ID
 *     responses:
 *       200:
 *         description: List of extinguishers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedExtinguisherResponse'
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
router.get("/", protect, getExtinguishers);

/**
 * @swagger
 * /api/extinguishers/dash/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics for fire extinguishers
 *     description: Returns total, active, expired, police notified counts and 5 most recent extinguishers. Users see only their own stats.
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStatsResponse'
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
router.get("/dash/dashboard-stats", protect, getDashboardStats);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   get:
 *     summary: Get a single fire extinguisher by ID
 *     description: Regular users can only view their own extinguishers. Admin and inspectors can view any.
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the extinguisher
 *     responses:
 *       200:
 *         description: Extinguisher retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FireExtinguisher'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - users can only view their own extinguishers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Extinguisher not found
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
router.get("/:id", protect, getExtinguisher);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   put:
 *     summary: Update fire extinguisher details (admin only)
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the extinguisher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExtinguisherRequest'
 *     responses:
 *       200:
 *         description: Extinguisher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FireExtinguisher'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
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
router.put(
  "/:id",
  protect,
  authorize("admin"),
  extinguisherRegistrationValidation,
  validateRequest,
  updateExtinguisher,
);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   delete:
 *     summary: Delete a fire extinguisher (admin only)
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the extinguisher
 *     responses:
 *       200:
 *         description: Extinguisher deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
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
router.delete("/:id", protect, authorize("admin"), deleteExtinguisher);

/**
 * @swagger
 * /api/extinguishers/{id}/mark-reported:
 *   put:
 *     summary: Mark extinguisher as reported (admin and inspector only)
 *     description: Changes the extinguisher status to 'reported'
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the extinguisher
 *     responses:
 *       200:
 *         description: Extinguisher marked as reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FireExtinguisher'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin or inspector role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Extinguisher not found
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
router.put(
  "/:id/mark-reported",
  protect,
  authorize("admin", "inspector"),
  markReported,
);

/**
 * @swagger
 * /api/extinguishers/{id}/inspect:
 *   post:
 *     summary: Conduct and log an inspection (admin and inspector only)
 *     description: Adds inspection log entry and updates status based on result. Pass sets status to active, fail sets to reported.
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the extinguisher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InspectExtinguisherRequest'
 *     responses:
 *       200:
 *         description: Inspection logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inspection logged successfully
 *                 data:
 *                   $ref: '#/components/schemas/FireExtinguisher'
 *       400:
 *         description: Invalid inspection result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin or inspector role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Extinguisher not found
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
router.post(
  "/:id/inspect",
  protect,
  authorize("admin", "inspector"),
  inspectExtinguisher,
);

/**
 * @swagger
 * /api/extinguishers/{id}/maintenance:
 *   post:
 *     summary: Schedule maintenance for an extinguisher (admin and inspector only)
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the extinguisher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleMaintenanceRequest'
 *     responses:
 *       200:
 *         description: Maintenance scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Maintenance scheduled successfully
 *                 data:
 *                   $ref: '#/components/schemas/FireExtinguisher'
 *       400:
 *         description: Missing required field
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin or inspector role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Extinguisher not found
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
router.post(
  "/:id/maintenance",
  protect,
  authorize("admin", "inspector"),
  scheduleMaintenance,
);

/**
 * @swagger
 * /api/extinguishers/{id}/schedule-inspection:
 *   post:
 *     summary: Schedule an inspection for an extinguisher (admin and user)
 *     description: Regular users can only schedule inspections for their own extinguishers
 *     tags: [Extinguisher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the extinguisher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInspectionRequest'
 *     responses:
 *       200:
 *         description: Inspection scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inspection scheduled successfully
 *                 data:
 *                   $ref: '#/components/schemas/FireExtinguisher'
 *       400:
 *         description: Missing required field
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - users can only schedule for their own extinguishers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Extinguisher not found
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
router.post(
  "/:id/schedule-inspection",
  protect,
  authorize("admin", "user"),
  scheduleInspection,
);

export default router;
