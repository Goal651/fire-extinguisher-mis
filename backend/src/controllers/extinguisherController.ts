import { Response } from "express";
import FireExtinguisher from "../models/FireExtinguisher";

export const createExtinguisher = async (req: any, res: Response) => {
  try {
    const existing = await FireExtinguisher.findOne({
      extinguisherId: req.body.extinguisherId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Extinguisher ID already exists",
      });
    }

    const extinguisher = await FireExtinguisher.create(req.body);

    return res.status(201).json({
      success: true,
      data: extinguisher,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create extinguisher",
    });
  }
};

export const getExtinguishers = async (req: any, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Role-based visibility logic
    if (req.user && req.user.role === "user") {
      filter.ownerEmail = req.user.email.toLowerCase();
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.$or = [
        {
          ownerName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          extinguisherId: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    const data = await FireExtinguisher.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const total = await FireExtinguisher.countDocuments(filter);

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch extinguishers",
    });
  }
};

export const getExtinguisher = async (req: any, res: Response) => {
  try {
    const extinguisher = await FireExtinguisher.findById(req.params.id);

    if (!extinguisher) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    // Role-based visibility check
    if (
      req.user &&
      req.user.role === "user" &&
      extinguisher.ownerEmail.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Access denied",
      });
    }

    return res.json({
      success: true,
      data: extinguisher,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch extinguisher",
    });
  }
};

export const updateExtinguisher = async (req: any, res: Response) => {
  try {
    const extinguisher = await FireExtinguisher.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.json({
      success: true,
      data: extinguisher,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to update extinguisher",
    });
  }
};

export const deleteExtinguisher = async (req: any, res: Response) => {
  try {
    await FireExtinguisher.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Extinguisher deleted",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to delete extinguisher",
    });
  }
};

export const markReported = async (req: any, res: Response) => {
  try {
    const extinguisher = await FireExtinguisher.findById(req.params.id);

    if (!extinguisher) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    extinguisher.status = "reported";

    await extinguisher.save();

    return res.json({
      success: true,
      data: extinguisher,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to mark reported",
    });
  }
};

export const getDashboardStats = async (req: any, res: Response) => {
  try {
    const filter: any = {};
    if (req.user && req.user.role === "user") {
      filter.ownerEmail = req.user.email.toLowerCase();
    }

    const total = await FireExtinguisher.countDocuments(filter);
    const active = await FireExtinguisher.countDocuments({ ...filter, status: "active" });
    const expired = await FireExtinguisher.countDocuments({ ...filter, status: "expired" });
    const policeNotified = await FireExtinguisher.countDocuments({ ...filter, status: "police_notified" });

    const recent = await FireExtinguisher.find(filter)
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        policeNotified,
        recent,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

// Inspector Logs Inspection
export const inspectExtinguisher = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { result, notes } = req.body;

    if (!result || !["pass", "fail"].includes(result)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inspection result. Must be 'pass' or 'fail'.",
      });
    }

    const extinguisher = await FireExtinguisher.findById(id);
    if (!extinguisher) {
      return res.status(404).json({
        success: false,
        message: "Extinguisher not found",
      });
    }

    // Append to inspection log
    extinguisher.inspectionLogs.push({
      inspectedAt: new Date(),
      inspectorId: req.user.id,
      result,
      notes,
    });

    extinguisher.inspectionStatus = "completed";

    // Update status based on inspection outcome
    if (result === "pass") {
      extinguisher.status = "active";
    } else {
      extinguisher.status = "reported";
    }

    await extinguisher.save();

    return res.json({
      success: true,
      message: "Inspection logged successfully",
      data: extinguisher,
    });
  } catch (error) {
    console.error("Failed to log inspection:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log inspection",
    });
  }
};

// Inspector Schedules Maintenance
export const scheduleMaintenance = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledMaintenanceDate, maintenanceNotes } = req.body;

    if (!scheduledMaintenanceDate) {
      return res.status(400).json({
        success: false,
        message: "Scheduled maintenance date is required",
      });
    }

    const extinguisher = await FireExtinguisher.findById(id);
    if (!extinguisher) {
      return res.status(404).json({
        success: false,
        message: "Extinguisher not found",
      });
    }

    extinguisher.scheduledMaintenanceDate = new Date(scheduledMaintenanceDate);
    extinguisher.maintenanceStatus = "scheduled";
    if (maintenanceNotes) {
      extinguisher.maintenanceNotes = maintenanceNotes;
    }

    await extinguisher.save();

    return res.json({
      success: true,
      message: "Maintenance scheduled successfully",
      data: extinguisher,
    });
  } catch (error) {
    console.error("Failed to schedule maintenance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule maintenance",
    });
  }
};

// User Schedules Inspection
export const scheduleInspection = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledInspectionDate } = req.body;

    if (!scheduledInspectionDate) {
      return res.status(400).json({
        success: false,
        message: "Scheduled inspection date is required",
      });
    }

    const extinguisher = await FireExtinguisher.findById(id);
    if (!extinguisher) {
      return res.status(404).json({
        success: false,
        message: "Extinguisher not found",
      });
    }

    // Regular users can only schedule for their own extinguisher
    if (
      req.user.role === "user" &&
      extinguisher.ownerEmail.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - You do not own this extinguisher",
      });
    }

    extinguisher.scheduledInspectionDate = new Date(scheduledInspectionDate);
    extinguisher.inspectionStatus = "pending";

    await extinguisher.save();

    return res.json({
      success: true,
      message: "Inspection scheduled successfully",
      data: extinguisher,
    });
  } catch (error) {
    console.error("Failed to schedule inspection:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule inspection",
    });
  }
};
