import { body } from "express-validator";
import { FireExtinguisherSize, FireExtinguisherType } from "../models/FireExtinguisher";

export const extinguisherRegistrationValidation = [
  body("serialNumber")
    .notEmpty()
    .withMessage("Serial number is required"),

  body("location")
    .notEmpty()
    .withMessage("Location is required"),
  body("type")
    .isIn(Object.values(FireExtinguisherType))
    .withMessage("Invalid extinguisher type"),
  body("size")
    .isIn(Object.values(FireExtinguisherSize))
    .withMessage("Invalid extinguisher size"),
  body("installationDate")
    .isISO8601()
    .withMessage("Invalid installation date"),
  body("expireationDate")
    .isISO8601()
    .withMessage("Invalid expiration date"),
  body("lastInspectionDate")
    .isISO8601()
    .withMessage("Invalid last inspection date"),
  body("nextInspectionDate")
    .isISO8601()
    .withMessage("Invalid next inspection date"),
  body("status")
    .isIn(["active", "expired", "reported"])
    .withMessage("Invalid status"),
  body("owner")
    .notEmpty()
    .withMessage("Owner is required")
];
