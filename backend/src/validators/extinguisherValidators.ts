import { body } from "express-validator";

export const extinguisherValidation = [
  body("extinguisherId").notEmpty(),

  body("ownerName").isLength({
    min: 2,
  }),

  body("ownerIdNumber").notEmpty(),

  body("ownerEmail").isEmail(),

  body("ownerPhone").notEmpty(),

  body("expirationDate").isISO8601(),

  body("dateOfIssue").isISO8601(),
];
