import { Request, Response } from "express";

import FireExtinguisher from "../models/FireExtinguisher";

export const createExtinguisher = async (req: Request, res: Response) => {
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

export const getExtinguishers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const filter: any = {};

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

export const getExtinguisher = async (req: Request, res: Response) => {
  try {
    const extinguisher = await FireExtinguisher.findById(req.params.id);

    if (!extinguisher) {
      return res.status(404).json({
        success: false,
        message: "Not found",
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

export const updateExtinguisher = async (req: Request, res: Response) => {
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

export const deleteExtinguisher = async (req: Request, res: Response) => {
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

export const markReported = async (req: Request, res: Response) => {
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

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const total = await FireExtinguisher.countDocuments();
    const active = await FireExtinguisher.countDocuments({ status: "active" });
    const expired = await FireExtinguisher.countDocuments({
      status: "expired",
    });
    const policeNotified = await FireExtinguisher.countDocuments({
      status: "police_notified",
    });

    const recent = await FireExtinguisher.find()
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
