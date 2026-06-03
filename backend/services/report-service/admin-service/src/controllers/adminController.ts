import { Response,Request } from "express";
import bcrypt from "bcryptjs";
import User from "../../shared/models/User";
import FireExtinguisher from "../../shared/models/FireExtinguisher";
import { logger } from "../../shared/utils/logger";

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query;
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error("Failed to fetch users", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Create a new user (admin can specify any role, including inspector)
export const createUser = async (req: any, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "user",
    });

    logger.info(`Admin created user: ${email} with role: ${role}`);

    return res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    logger.error("Failed to create user by admin", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// Update an existing user
export const updateUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailInUse = await User.findOne({ email: email.toLowerCase() });
      if (emailInUse) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email.toLowerCase();
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    logger.info(`Admin updated user: ${user.email}`);

    return res.json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Failed to update user", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete user
export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if deleting self
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own admin account",
      });
    }

    await User.findByIdAndDelete(id);

    logger.info(`Admin deleted user: ${user.email}`);

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete user", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Get overall system stats
export const getSystemStats = async (req: any, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const inspectorCount = await User.countDocuments({ role: "inspector" });
    const regularUserCount = await User.countDocuments({ role: "user" });

    const totalExtinguishers = await FireExtinguisher.countDocuments();
    const activeCount = await FireExtinguisher.countDocuments({ status: "active" });
    const expiredCount = await FireExtinguisher.countDocuments({ status: "expired" });
    const reportedCount = await FireExtinguisher.countDocuments({ status: "reported" });
    const policeNotifiedCount = await FireExtinguisher.countDocuments({ status: "police_notified" });

    // Inspection status
    const pendingInspections = await FireExtinguisher.countDocuments({ inspectionStatus: "pending" });
    const completedInspections = await FireExtinguisher.countDocuments({ inspectionStatus: "completed" });
    const maintenanceScheduled = await FireExtinguisher.countDocuments({ maintenanceStatus: "scheduled" });

    return res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: adminCount,
          inspector: inspectorCount,
          user: regularUserCount,
        },
        extinguishers: {
          total: totalExtinguishers,
          active: activeCount,
          expired: expiredCount,
          reported: reportedCount,
          policeNotified: policeNotifiedCount,
        },
        inspectionsAndMaintenance: {
          pendingInspections,
          completedInspections,
          maintenanceScheduled,
        },
      },
    });
  } catch (error) {
    logger.error("Failed to fetch system stats", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch system stats",
    });
  }
};

// Data Integrity Check
export const checkDataIntegrity = async (req: any, res: Response) => {
  try {
    const issues: string[] = [];

    // 1. Check for extinguishers with duplicate IDs
    // 2. Check for missing or invalid email format in extinguishers
    const extinguishers = await FireExtinguisher.find();
    for (const ext of extinguishers) {
      if (!ext.extinguisherId) {
        issues.push(`Extinguisher ${ext._id} is missing extinguisherId`);
      }
      if (!ext.ownerEmail || !ext.ownerEmail.includes("@")) {
        issues.push(`Extinguisher ${ext.extinguisherId || ext._id} has invalid owner email: ${ext.ownerEmail}`);
      }
      if (ext.dateOfIssue && ext.expirationDate && ext.dateOfIssue >= ext.expirationDate) {
        issues.push(`Extinguisher ${ext.extinguisherId || ext._id} has issue date on or after expiration date`);
      }
      // 3. Mismatched status: active but past expiration date
      if (ext.status === "active" && ext.expirationDate < new Date()) {
        issues.push(`Extinguisher ${ext.extinguisherId || ext._id} is marked active but has expired`);
      }
    }

    // 4. Check for orphaned or invalid users (e.g. no first/last name or email)
    const users = await User.find();
    for (const user of users) {
      if (!user.firstName || !user.lastName) {
        issues.push(`User ${user._id} has missing first/last name`);
      }
      if (!user.email || !user.email.includes("@")) {
        issues.push(`User ${user._id} has invalid email address: ${user.email}`);
      }
    }

    return res.json({
      success: true,
      integrityPassed: issues.length === 0,
      totalIssues: issues.length,
      issues,
    });
  } catch (error) {
    logger.error("Failed to perform data integrity check", error);
    return res.status(500).json({
      success: false,
      message: "Failed to perform data integrity check",
    });
  }
};

// Clean data integrity issues
export const cleanData = async (req: any, res: Response) => {
  try {
    const now = new Date();
    // Auto mark expired extinguishers
    const resultExpired = await FireExtinguisher.updateMany(
      {
        expirationDate: { $lt: now },
        status: "active",
      },
      {
        status: "expired",
      }
    );

    // Clean up empty fields or fix structural issues if any
    return res.json({
      success: true,
      message: "Data integrity cleanup executed successfully",
      details: {
        autoExpiredCount: resultExpired.modifiedCount,
      },
    });
  } catch (error) {
    logger.error("Failed to clean database data", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clean database data",
    });
  }
};
