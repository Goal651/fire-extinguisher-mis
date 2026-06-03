import { body } from "express-validator";

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
