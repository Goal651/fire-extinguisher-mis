import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fire Extinguisher Management API",
      version: "1.0.0",
      description:
        "API for managing fire extinguishers with expiry tracking and automated compliance notifications. Supports role-based access control for Admins, Inspectors, and regular Users.",
      contact: {
        name: "TZW LTD",
        email: "admin@companyxyz.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Login, OTP verification, registration, and password management",
      },
      {
        name: "Admin",
        description: "Admin-only operations: user management and system diagnostics",
      },
      {
        name: "Extinguisher",
        description: "Fire extinguisher CRUD, inspections, maintenance, and reporting",
      },
      {
        name: "Reports",
        description: "Real-time analytics: stock levels, inspection status, expired units, and maintenance history — all with daily/monthly/yearly trend data",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from the login flow",
        },
      },
      schemas: {
        // ──────────────────────────────────────────
        // User / Auth Schemas
        // ──────────────────────────────────────────
        Admin: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "64b1f9c2e4b0f1a2b3c4d5e6",
              description: "User unique identifier",
            },
            firstName: {
              type: "string",
              example: "Alice",
              description: "First name",
            },
            lastName: {
              type: "string",
              example: "Smith",
              description: "Last name",
            },
            email: {
              type: "string",
              format: "email",
              example: "alice@example.com",
              description: "Email address",
            },
            role: {
              type: "string",
              enum: ["admin", "inspector", "user"],
              example: "admin",
              description: "User role",
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
              example: "alice@example.com",
              description: "Registered email address",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "secret123",
              description: "Account password (min 6 characters)",
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
              example: "alice@example.com",
              description: "Email address used for login",
            },
            otp: {
              type: "string",
              minLength: 6,
              maxLength: 6,
              example: "483920",
              description: "6-digit OTP code sent to email",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: {
              type: "string",
              minLength: 2,
              example: "Alice",
            },
            lastName: {
              type: "string",
              minLength: 2,
              example: "Smith",
            },
            email: {
              type: "string",
              format: "email",
              example: "alice@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "secret123",
            },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "alice@example.com",
              description: "Email address of the account to reset",
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "password"],
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description: "Reset token received via email",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "newSecret123",
              description: "New password (min 6 characters)",
            },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            firstName: {
              type: "string",
              minLength: 2,
              example: "Alice",
            },
            lastName: {
              type: "string",
              minLength: 2,
              example: "Smith",
            },
            email: {
              type: "string",
              format: "email",
              example: "alice@example.com",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: {
              type: "string",
              example: "oldSecret123",
              description: "Current account password",
            },
            newPassword: {
              type: "string",
              minLength: 6,
              example: "newSecret456",
              description: "New password (min 6 characters)",
            },
          },
        },
        // ──────────────────────────────────────────
        // Admin User Management Schemas
        // ──────────────────────────────────────────
        CreateUserRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: {
              type: "string",
              minLength: 2,
              example: "Bob",
            },
            lastName: {
              type: "string",
              minLength: 2,
              example: "Jones",
            },
            email: {
              type: "string",
              format: "email",
              example: "bob@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "pass1234",
              description: "Initial password for the new user",
            },
            role: {
              type: "string",
              enum: ["admin", "inspector", "user"],
              default: "user",
              example: "inspector",
              description: "Role assigned to the new user (defaults to 'user')",
            },
          },
        },
        UpdateUserRequest: {
          type: "object",
          properties: {
            firstName: {
              type: "string",
              minLength: 2,
              example: "Bob",
            },
            lastName: {
              type: "string",
              minLength: 2,
              example: "Jones",
            },
            email: {
              type: "string",
              format: "email",
              example: "bob@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "newPass1234",
              description: "Optional new password",
            },
            role: {
              type: "string",
              enum: ["admin", "inspector", "user"],
              example: "user",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "64b1f9c2e4b0f1a2b3c4d5e6",
            },
            firstName: {
              type: "string",
              example: "Bob",
            },
            lastName: {
              type: "string",
              example: "Jones",
            },
            email: {
              type: "string",
              format: "email",
              example: "bob@example.com",
            },
            role: {
              type: "string",
              enum: ["admin", "inspector", "user"],
              example: "inspector",
            },
          },
        },
        // ──────────────────────────────────────────
        // Admin Stats Schemas
        // ──────────────────────────────────────────
        SystemStatsResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                users: {
                  type: "object",
                  properties: {
                    total: { type: "integer", example: 42 },
                    admin: { type: "integer", example: 3 },
                    inspector: { type: "integer", example: 10 },
                    user: { type: "integer", example: 29 },
                  },
                },
                extinguishers: {
                  type: "object",
                  properties: {
                    total: { type: "integer", example: 150 },
                    active: { type: "integer", example: 120 },
                    expired: { type: "integer", example: 20 },
                    reported: { type: "integer", example: 7 },
                    policeNotified: { type: "integer", example: 3 },
                  },
                },
                inspectionsAndMaintenance: {
                  type: "object",
                  properties: {
                    pendingInspections: { type: "integer", example: 15 },
                    completedInspections: { type: "integer", example: 80 },
                    maintenanceScheduled: { type: "integer", example: 5 },
                  },
                },
              },
            },
          },
        },
        DataIntegrityCheckResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            integrityPassed: { type: "boolean", example: false },
            totalIssues: { type: "integer", example: 2 },
            issues: {
              type: "array",
              items: { type: "string" },
              example: [
                "Extinguisher EXT-001 is marked active but has expired",
                "User 64b1f9c2 has missing first/last name",
              ],
            },
          },
        },
        DataIntegrityCleanResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Data integrity cleanup executed successfully",
            },
            details: {
              type: "object",
              properties: {
                autoExpiredCount: {
                  type: "integer",
                  example: 5,
                  description: "Number of extinguishers automatically marked as expired",
                },
              },
            },
          },
        },
        // ──────────────────────────────────────────
        // Fire Extinguisher Schemas
        // ──────────────────────────────────────────
        InspectionLog: {
          type: "object",
          properties: {
            inspectedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-01T10:00:00.000Z",
            },
            inspectorId: {
              type: "string",
              example: "64b1f9c2e4b0f1a2b3c4d5e6",
            },
            result: {
              type: "string",
              enum: ["pass", "fail"],
              example: "pass",
            },
            notes: {
              type: "string",
              example: "Pressure normal, pin intact.",
            },
          },
        },
        FireExtinguisher: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "64b1f9c2e4b0f1a2b3c4d5e6",
              description: "MongoDB unique identifier",
            },
            extinguisherId: {
              type: "string",
              example: "EXT-2024-001",
              description: "Unique extinguisher serial/ID",
            },
            ownerName: {
              type: "string",
              example: "John Doe",
            },
            ownerIdNumber: {
              type: "string",
              example: "1234567890123",
            },
            ownerEmail: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            ownerPhone: {
              type: "string",
              example: "+250788000000",
            },
            dateOfIssue: {
              type: "string",
              format: "date",
              example: "2023-01-15",
            },
            expirationDate: {
              type: "string",
              format: "date",
              example: "2025-01-15",
            },
            status: {
              type: "string",
              enum: ["active", "expired", "reported", "police_notified"],
              example: "active",
            },
            alertSentAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
            reminderSentAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
            policeNotifiedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
            notes: {
              type: "string",
              example: "Stored in main lobby.",
            },
            scheduledInspectionDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2025-07-01T09:00:00.000Z",
            },
            inspectionStatus: {
              type: "string",
              enum: ["none", "pending", "completed"],
              example: "pending",
            },
            scheduledMaintenanceDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
            maintenanceStatus: {
              type: "string",
              enum: ["none", "scheduled", "completed"],
              example: "none",
            },
            maintenanceNotes: {
              type: "string",
              example: "Valve replacement required.",
            },
            inspectionLogs: {
              type: "array",
              items: { $ref: "#/components/schemas/InspectionLog" },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-01-15T08:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-01T10:00:00.000Z",
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
              example: "EXT-2024-001",
              description: "Unique extinguisher serial/ID (must not already exist)",
            },
            ownerName: {
              type: "string",
              minLength: 2,
              example: "John Doe",
            },
            ownerIdNumber: {
              type: "string",
              example: "1234567890123",
            },
            ownerEmail: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            ownerPhone: {
              type: "string",
              example: "+250788000000",
            },
            dateOfIssue: {
              type: "string",
              format: "date",
              example: "2023-01-15",
              description: "Must be before expirationDate",
            },
            expirationDate: {
              type: "string",
              format: "date",
              example: "2025-01-15",
              description: "Must be in the future",
            },
            notes: {
              type: "string",
              example: "Stored in main lobby.",
            },
          },
        },
        UpdateExtinguisherRequest: {
          type: "object",
          properties: {
            extinguisherId: {
              type: "string",
              example: "EXT-2024-001",
            },
            ownerName: {
              type: "string",
              minLength: 2,
              example: "John Doe",
            },
            ownerIdNumber: {
              type: "string",
              example: "1234567890123",
            },
            ownerEmail: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            ownerPhone: {
              type: "string",
              example: "+250788000000",
            },
            dateOfIssue: {
              type: "string",
              format: "date",
              example: "2023-01-15",
            },
            expirationDate: {
              type: "string",
              format: "date",
              example: "2025-01-15",
            },
            notes: {
              type: "string",
              example: "Moved to server room.",
            },
          },
        },
        InspectExtinguisherRequest: {
          type: "object",
          required: ["result"],
          properties: {
            result: {
              type: "string",
              enum: ["pass", "fail"],
              example: "pass",
              description: "Outcome of the physical inspection",
            },
            notes: {
              type: "string",
              example: "Pressure normal. Pin intact.",
              description: "Optional inspector notes",
            },
          },
        },
        ScheduleMaintenanceRequest: {
          type: "object",
          required: ["scheduledMaintenanceDate"],
          properties: {
            scheduledMaintenanceDate: {
              type: "string",
              format: "date-time",
              example: "2025-08-01T09:00:00.000Z",
              description: "Date and time for the scheduled maintenance",
            },
            maintenanceNotes: {
              type: "string",
              example: "Valve replacement required.",
              description: "Optional notes for the maintenance team",
            },
          },
        },
        ScheduleInspectionRequest: {
          type: "object",
          required: ["scheduledInspectionDate"],
          properties: {
            scheduledInspectionDate: {
              type: "string",
              format: "date-time",
              example: "2025-07-01T09:00:00.000Z",
              description: "Date and time for the scheduled inspection",
            },
          },
        },
        DashboardStatsResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                total: { type: "integer", example: 50 },
                active: { type: "integer", example: 35 },
                expired: { type: "integer", example: 10 },
                policeNotified: { type: "integer", example: 2 },
                recent: {
                  type: "array",
                  items: { $ref: "#/components/schemas/FireExtinguisher" },
                  description: "5 most recently added extinguishers",
                },
              },
            },
          },
        },
        // ──────────────────────────────────────────
        // Generic Response Schemas
        // ──────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation completed successfully" },
          },
        },
        PaginatedExtinguisherResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/FireExtinguisher" },
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                total: { type: "integer", example: 150 },
                pages: { type: "integer", example: 15 },
              },
            },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/UserResponse" },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: {
              type: "string",
              example: "An error occurred",
              description: "Human-readable error message",
            },
            errors: {
              type: "array",
              description: "Field-level validation errors (if any)",
              items: {
                type: "object",
                properties: {
                  msg: { type: "string", example: "Valid email required" },
                  param: { type: "string", example: "email" },
                  location: { type: "string", example: "body" },
                },
              },
            },
          },
        },
        // ──────────────────────────────────────────
        // Report Schemas
        // ──────────────────────────────────────────
        PeriodBucket: {
          type: "object",
          properties: {
            label: { type: "string", example: "2025-06", description: "Period label: YYYY-MM-DD / YYYY-MM / YYYY" },
            count: { type: "integer", example: 12 },
          },
        },
        StockReportData: {
          type: "object",
          properties: {
            total: { type: "integer", example: 150 },
            breakdown: {
              type: "object",
              properties: {
                active: { type: "integer", example: 100 },
                expired: { type: "integer", example: 30 },
                reported: { type: "integer", example: 15 },
                police_notified: { type: "integer", example: 5 },
              },
            },
            trend: {
              type: "array",
              items: { $ref: "#/components/schemas/PeriodBucket" },
              description: "Number of extinguishers registered per period bucket",
            },
          },
        },
        InspectionTrendBucket: {
          type: "object",
          properties: {
            label: { type: "string", example: "2025-06" },
            count: { type: "integer", example: 20 },
            pass: { type: "integer", example: 15 },
            fail: { type: "integer", example: 5 },
          },
        },
        InspectionReportData: {
          type: "object",
          properties: {
            totalInspectionsLogged: { type: "integer", example: 200 },
            statusBreakdown: {
              type: "object",
              properties: {
                none: { type: "integer", example: 60 },
                pending: { type: "integer", example: 40 },
                completed: { type: "integer", example: 50 },
              },
            },
            resultBreakdown: {
              type: "object",
              properties: {
                pass: { type: "integer", example: 160 },
                fail: { type: "integer", example: 40 },
              },
            },
            passRate: { type: "number", example: 80.00, description: "Percentage of inspections that passed (0-100)" },
            trend: {
              type: "array",
              items: { $ref: "#/components/schemas/InspectionTrendBucket" },
            },
          },
        },
        ExpiredExtinguisherItem: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64b1f9c2e4b0f1a2b3c4d5e6" },
            extinguisherId: { type: "string", example: "EXT-2024-001" },
            ownerName: { type: "string", example: "John Doe" },
            ownerEmail: { type: "string", example: "john@example.com" },
            ownerPhone: { type: "string", example: "+250788000000" },
            expirationDate: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["expired", "reported", "police_notified"] },
            daysSinceExpiry: { type: "integer", example: 45 },
            policeNotified: { type: "boolean", example: false },
            policeNotifiedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        ExpiredReportData: {
          type: "object",
          properties: {
            total: { type: "integer", example: 50 },
            policeNotifiedCount: { type: "integer", example: 5 },
            trend: {
              type: "array",
              items: { $ref: "#/components/schemas/PeriodBucket" },
              description: "Number of extinguishers that expired per period bucket",
            },
            records: {
              type: "array",
              items: { $ref: "#/components/schemas/ExpiredExtinguisherItem" },
            },
          },
        },
        ExpiredSummaryData: {
          type: "object",
          properties: {
            total: { type: "integer", example: 50 },
            policeNotifiedCount: { type: "integer", example: 5 },
            trend: {
              type: "array",
              items: { $ref: "#/components/schemas/PeriodBucket" },
            },
          },
        },
        MaintenanceHistoryItem: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64b1f9c2e4b0f1a2b3c4d5e6" },
            extinguisherId: { type: "string", example: "EXT-2024-001" },
            ownerName: { type: "string", example: "John Doe" },
            scheduledMaintenanceDate: { type: "string", format: "date-time", nullable: true },
            maintenanceStatus: { type: "string", enum: ["none", "scheduled", "completed"] },
            maintenanceNotes: { type: "string", nullable: true },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        MaintenanceReportData: {
          type: "object",
          properties: {
            statusBreakdown: {
              type: "object",
              properties: {
                none: { type: "integer", example: 80 },
                scheduled: { type: "integer", example: 40 },
                completed: { type: "integer", example: 30 },
              },
            },
            trend: {
              type: "array",
              items: { $ref: "#/components/schemas/PeriodBucket" },
              description: "Number of maintenance events per period bucket",
            },
            records: {
              type: "array",
              items: { $ref: "#/components/schemas/MaintenanceHistoryItem" },
            },
          },
        },
        MaintenanceSummaryData: {
          type: "object",
          properties: {
            statusBreakdown: {
              type: "object",
              properties: {
                none: { type: "integer", example: 80 },
                scheduled: { type: "integer", example: 40 },
                completed: { type: "integer", example: 30 },
              },
            },
            trend: {
              type: "array",
              items: { $ref: "#/components/schemas/PeriodBucket" },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
