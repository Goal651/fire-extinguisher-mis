import { body } from "express-validator";
import { FireExtinguisherSize, FireExtinguisherType } from "../../shared/models/FireExtinguisher";

export const extinguisherRegistrationValidation = [
  body("extinguisherId")
    .notEmpty()
    .withMessage("Extinguisher ID is required"),
  body("ownerName")
    .notEmpty()
    .withMessage("Owner Name is required"),
  body("ownerIdNumber")
    .notEmpty()
    .withMessage("Owner ID Number is required"),
  body("ownerEmail")
    .isEmail()
    .withMessage("Valid owner email is required"),
  body("type")
    .notEmpty()
    .isIn([FireExtinguisherType.WATER, FireExtinguisherType.CO2, FireExtinguisherType.FOAM, FireExtinguisherType.DRY_CHEMICAL])
    .withMessage("Invalid extinguisher type"),
  body("size")
    .notEmpty()
    .isIn([FireExtinguisherSize["2.5LBS"], FireExtinguisherSize["5LBS"], FireExtinguisherSize["9LBS"], FireExtinguisherSize["12LBS"]])
    .withMessage("Invalid extinguisher size"),
  body("ownerPhone")
    .notEmpty()
    .withMessage("Owner phone is required"),
  body("dateOfIssue")
    .isISO8601()
    .withMessage("Invalid issue date"),
  body("expirationDate")
    .isISO8601()
    .withMessage("Invalid expiration date"),
  body("status")
    .optional()
    .isIn(["active", "expired", "reported", "police_notified"])
    .withMessage("Invalid status"),
  body("notes")
    .optional()
];
