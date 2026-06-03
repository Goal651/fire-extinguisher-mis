import { Router } from "express";
import { body } from "express-validator";

import {
  createExtinguisher,
  getExtinguishers,
  getExtinguisher,
  updateExtinguisher,
  deleteExtinguisher,
  markReported,
  getDashboardStats,
} from "../controllers/extinguisherController";

import { protect } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";

const router = Router();

const extinguisherValidation = [
  body("extinguisherId")
    .trim()
    .notEmpty()
    .withMessage("Extinguisher ID required"),

  body("ownerName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Owner name required"),

  body("ownerIdNumber").trim().notEmpty().withMessage("Owner ID required"),

  body("ownerEmail").isEmail().withMessage("Valid email required"),

  body("ownerPhone").trim().notEmpty(),

  body("dateOfIssue")
    .isISO8601()
    .custom((value, { req }) => {
      const issueDate = new Date(value);

      const expiryDate = new Date(req.body.expirationDate);

      if (issueDate >= expiryDate) {
        throw new Error("Issue date must be before expiry date");
      }

      return true;
    }),

  body("expirationDate")
    .isISO8601()
    .custom((value) => {
      const expiry = new Date(value);

      if (expiry <= new Date()) {
        throw new Error("Expiration date must be in future");
      }

      return true;
    }),
];

/**
 * @swagger
 * /api/extinguishers:
 *   post:
 *     summary: Create a new fire extinguisher record
 *     tags: [Fire Extinguishers]
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
 *         description: Validation error or duplicate extinguisher ID
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
  extinguisherValidation,
  validateRequest,
  createExtinguisher,
);

/**
 * @swagger
 * /api/extinguishers:
 *   get:
 *     summary: Get all fire extinguishers with pagination and filtering
 *     tags: [Fire Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
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
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by owner name or extinguisher ID
 *     responses:
 *       200:
 *         description: Extinguishers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
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
 * /api/extinguishers/{id}:
 *   get:
 *     summary: Get a single fire extinguisher by ID
 *     tags: [Fire Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Extinguisher MongoDB ID
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
 *     summary: Update a fire extinguisher record
 *     tags: [Fire Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Extinguisher MongoDB ID
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
  extinguisherValidation,
  validateRequest,
  updateExtinguisher,
);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   delete:
 *     summary: Delete a fire extinguisher record
 *     tags: [Fire Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Extinguisher MongoDB ID
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", protect, deleteExtinguisher);

/**
 * @swagger
 * /api/extinguishers/{id}/mark-reported:
 *   put:
 *     summary: Mark a fire extinguisher as reported
 *     tags: [Fire Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Extinguisher MongoDB ID
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
router.put("/:id/mark-reported", protect, markReported);

/**
 * @swagger
 * /api/extinguishers/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Fire Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     expired:
 *                       type: integer
 *                     policeNotified:
 *                       type: integer
 *                     recent:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FireExtinguisher'
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

export default router;
