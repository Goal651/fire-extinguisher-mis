import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemStats,
  checkDataIntegrity,
  cleanData,
} from "../controllers/adminController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// Secure all admin routes
router.use(protect);
router.use(authorize("admin"));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Retrieve all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/users", getUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/users", createUser);
/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update an existing user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/users/:id", updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/users/:id", deleteUser);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get overall system statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", getSystemStats);

/**
 * @swagger
 * /api/admin/data-integrity/check:
 *   post:
 *     summary: Perform a diagnostic check of data integrity (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/data-integrity/check", checkDataIntegrity);

/**
 * @swagger
 * /api/admin/data-integrity/clean:
 *   post:
 *     summary: Execute a cleanup of expired status or invalid entries (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/data-integrity/clean", cleanData);

export default router;