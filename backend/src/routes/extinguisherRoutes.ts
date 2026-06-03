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

// Create a new extinguisher (admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  extinguisherRegistrationValidation,
  validateRequest,
  createExtinguisher,
);

// Get all extinguishers with pagination (all roles - filtered in controller)
router.get("/", protect, getExtinguishers);

// Get dashboard stats (all roles)
router.get("/dash/dashboard-stats", protect, getDashboardStats);

// Get details of a single extinguisher (all roles - ownership check in controller)
router.get("/:id", protect, getExtinguisher);

// Update extinguisher details (admin only)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  extinguisherRegistrationValidation,
  validateRequest,
  updateExtinguisher,
);

// Delete extinguisher (admin only)
router.delete("/:id", protect, authorize("admin"), deleteExtinguisher);

// Mark as reported (admin and inspectors)
router.put(
  "/:id/mark-reported",
  protect,
  authorize("admin", "inspector"),
  markReported,
);

// Inspector conducting an inspection
router.post(
  "/:id/inspect",
  protect,
  authorize("admin", "inspector"),
  inspectExtinguisher,
);

// Inspector scheduling maintenance
router.post(
  "/:id/maintenance",
  protect,
  authorize("admin", "inspector"),
  scheduleMaintenance,
);

// User scheduling an inspection
router.post(
  "/:id/schedule-inspection",
  protect,
  authorize("admin", "user"),
  scheduleInspection,
);

export default router;
