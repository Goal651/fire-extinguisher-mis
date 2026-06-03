import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fire Extinguisher Management API",
      version: "1.0.0",
      description: "API for managing fire extinguishers with expiry tracking and automated compliance notifications",
      contact: {
        name: "Company XYZ",
        email: "admin@companyxyz.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Admin: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Admin unique identifier",
            },
            name: {
              type: "string",
              description: "Admin full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "Admin email address",
            },
          },
        },
        FireExtinguisher: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Extinguisher unique identifier",
            },
            extinguisherId: {
              type: "string",
              description: "Unique extinguisher ID",
            },
            ownerName: {
              type: "string",
              description: "Owner full name",
            },
            ownerIdNumber: {
              type: "string",
              description: "Owner ID number",
            },
            ownerEmail: {
              type: "string",
              format: "email",
              description: "Owner email address",
            },
            ownerPhone: {
              type: "string",
              description: "Owner phone number",
            },
            dateOfIssue: {
              type: "string",
              format: "date",
              description: "Date of issue",
            },
            expirationDate: {
              type: "string",
              format: "date",
              description: "Expiration date",
            },
            status: {
              type: "string",
              enum: ["active", "expired", "reported", "police_notified"],
              description: "Current status of the extinguisher",
            },
            alertSentAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Timestamp when expiry alert was sent",
            },
            reminderSentAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Timestamp when reminder was sent",
            },
            policeNotifiedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Timestamp when police were notified",
            },
            notes: {
              type: "string",
              description: "Additional notes",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Record creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Record update timestamp",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Admin email address",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "Admin password",
            },
          },
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Email address used for login",
            },
            otp: {
              type: "string",
              length: 6,
              description: "6-digit OTP code",
            },
          },
        },
        CreateExtinguisherRequest: {
          type: "object",
          required: [
            "extinguisherId",
            "ownerName",
            "ownerIdNumber",
            "ownerEmail",
            "ownerPhone",
            "dateOfIssue",
            "expirationDate",
          ],
          properties: {
            extinguisherId: {
              type: "string",
              description: "Unique extinguisher ID",
            },
            ownerName: {
              type: "string",
              minLength: 2,
              description: "Owner full name",
            },
            ownerIdNumber: {
              type: "string",
              description: "Owner ID number",
            },
            ownerEmail: {
              type: "string",
              format: "email",
              description: "Owner email address",
            },
            ownerPhone: {
              type: "string",
              description: "Owner phone number",
            },
            dateOfIssue: {
              type: "string",
              format: "date",
              description: "Date of issue (must be before expiration date)",
            },
            expirationDate: {
              type: "string",
              format: "date",
              description: "Expiration date (must be in the future)",
            },
            notes: {
              type: "string",
              description: "Additional notes",
            },
          },
        },
        UpdateExtinguisherRequest: {
          type: "object",
          properties: {
            extinguisherId: {
              type: "string",
              description: "Unique extinguisher ID",
            },
            ownerName: {
              type: "string",
              minLength: 2,
              description: "Owner full name",
            },
            ownerIdNumber: {
              type: "string",
              description: "Owner ID number",
            },
            ownerEmail: {
              type: "string",
              format: "email",
              description: "Owner email address",
            },
            ownerPhone: {
              type: "string",
              description: "Owner phone number",
            },
            dateOfIssue: {
              type: "string",
              format: "date",
              description: "Date of issue",
            },
            expirationDate: {
              type: "string",
              format: "date",
              description: "Expiration date",
            },
            notes: {
              type: "string",
              description: "Additional notes",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                  },
                  param: {
                    type: "string",
                  },
                  location: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/FireExtinguisher",
              },
            },
            pagination: {
              type: "object",
              properties: {
                page: {
                  type: "number",
                },
                limit: {
                  type: "number",
                },
                total: {
                  type: "number",
                },
                pages: {
                  type: "number",
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
