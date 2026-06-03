# Fire Extinguisher Management System - System Design

## Overview
A comprehensive system for managing fire extinguisher records with automated compliance tracking, expiry notifications, and police escalation for non-compliant owners.

## System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        AuthContext[Auth Context]
        Services[API Services]
        Pages[Pages & Components]
    end
    
    subgraph "Backend (Express.js)"
        API[REST API]
        Auth[Auth Controller]
        Extinguisher[Extinguisher Controller]
        Middleware[Middleware]
        Cron[Cron Jobs]
        Email[Email Service]
    end
    
    subgraph "Database (MongoDB)"
        Admin[Admin Collection]
        Extinguisher[Extinguisher Collection]
        OTP[OTP Collection]
    end
    
    subgraph "External Services"
        SMTP[SMTP Mail Server]
        Police[Police Email]
    end
    
    UI --> AuthContext
    AuthContext --> Services
    Pages --> Services
    Services --> API
    API --> Auth
    API --> Extinguisher
    API --> Middleware
    Auth --> Admin
    Auth --> OTP
    Extinguisher --> Extinguisher
    Cron --> Extinguisher
    Cron --> Email
    Email --> SMTP
    Email --> Police
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB
    participant EmailService
    
    User->>Frontend: Enter Email & Password
    Frontend->>Backend: POST /api/auth/login
    Backend->>MongoDB: Find Admin by Email
    MongoDB-->>Backend: Admin Data
    Backend->>MongoDB: Generate & Save OTP
    Backend->>EmailService: Send OTP Email
    EmailService-->>User: OTP Code
    Backend-->>Frontend: Success
    Frontend-->>User: Redirect to OTP Page
    
    User->>Frontend: Enter OTP
    Frontend->>Backend: POST /api/auth/verify-otp
    Backend->>MongoDB: Verify OTP
    Backend->>Backend: Generate JWT Token
    Backend-->>Frontend: JWT Token + Admin Data
    Frontend->>Frontend: Store Token in localStorage
    Frontend->>Frontend: Update AuthContext
    Frontend-->>User: Redirect to Dashboard
```

## Extinguisher Management Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant MongoDB
    
    Admin->>Frontend: Create New Extinguisher
    Frontend->>Frontend: Validate Form (Zod)
    Frontend->>Backend: POST /api/extinguishers
    Backend->>Backend: Validate Request
    Backend->>MongoDB: Check Duplicate ID
    Backend->>MongoDB: Create Extinguisher
    MongoDB-->>Backend: Created Document
    Backend-->>Frontend: Success Response
    Frontend-->>Admin: Success Toast + Redirect
    
    Admin->>Frontend: View Extinguishers List
    Frontend->>Backend: GET /api/extinguishers (with pagination)
    Backend->>MongoDB: Query with Filters
    MongoDB-->>Backend: Paginated Results
    Backend-->>Frontend: Data + Pagination Info
    Frontend-->>Admin: Display Table
    
    Admin->>Frontend: Edit Extinguisher
    Frontend->>Backend: GET /api/extinguishers/:id
    Backend->>MongoDB: Find by ID
    MongoDB-->>Backend: Document
    Backend-->>Frontend: Extinguisher Data
    Frontend-->>Admin: Pre-fill Form
    Admin->>Frontend: Submit Changes
    Frontend->>Backend: PUT /api/extinguishers/:id
    Backend->>MongoDB: Update Document
    Backend-->>Frontend: Success
    Frontend-->>Admin: Success Toast + Redirect
    
    Admin->>Frontend: Mark as Reported
    Frontend->>Backend: PUT /api/extinguishers/:id/mark-reported
    Backend->>MongoDB: Update Status to 'reported'
    Backend-->>Frontend: Success
    Frontend-->>Admin: Success Toast
```

## Database Schema

```mermaid
erDiagram
    Admin ||--o{ FireExtinguisher : creates
    Admin ||--o{ OTP : generates
    
    Admin {
        string _id PK
        string name
        string email UK
        string password
        date createdAt
    }
    
    FireExtinguisher {
        string _id PK
        string extinguisherId UK
        string ownerName
        string ownerIdNumber
        string ownerEmail
        string ownerPhone
        date dateOfIssue
        date expirationDate
        string status
        date alertSentAt
        date reminderSentAt
        date policeNotifiedAt
        string notes
        date createdAt
        date updatedAt
    }
    
    OTP {
        string _id PK
        string email
        string code
        date expiresAt
        boolean used
        date createdAt
    }
```

## API Endpoints Structure

```mermaid
graph LR
    subgraph "Authentication API"
        A1[POST /api/auth/login]
        A2[POST /api/auth/verify-otp]
        A3[POST /api/auth/resend-otp]
        A4[GET /api/auth/me]
        A5[POST /api/auth/logout]
    end
    
    subgraph "Extinguisher API"
        E1[POST /api/extinguishers]
        E2[GET /api/extinguishers]
        E3[GET /api/extinguishers/:id]
        E4[PUT /api/extinguishers/:id]
        E5[DELETE /api/extinguishers/:id]
        E6[PUT /api/extinguishers/:id/mark-reported]
        E7[GET /api/extinguishers/dashboard-stats]
    end
    
    subgraph "Documentation"
        D1[GET /api-docs]
    end
    
    subgraph "Health"
        H1[GET /]
        H2[GET /health]
    end
```

## Cron Job Workflow

```mermaid
sequenceDiagram
    participant CronScheduler
    participant CronService
    participant MongoDB
    participant EmailService
    participant Owner
    participant Police
    
    Note over CronScheduler: Daily at 9:00 AM
    
    CronScheduler->>CronService: Check Expiring Extinguishers
    CronService->>MongoDB: Find expiring in 30 days
    MongoDB-->>CronService: List of Extinguishers
    loop For Each Extinguisher
        CronService->>EmailService: Send Warning Email
        EmailService-->>Owner: Expiry Warning
        CronService->>MongoDB: Update alertSentAt
    end
    
    Note over CronScheduler: Daily at 9:30 AM
    
    CronScheduler->>CronService: Check Expired Extinguishers
    CronService->>MongoDB: Find expired > 7 days
    MongoDB-->>CronService: List of Extinguishers
    loop For Each Extinguisher
        alt Not Police Notified
            CronService->>EmailService: Send Police Escalation
            EmailService-->>Police: Non-compliance Report
            CronService->>MongoDB: Update policeNotifiedAt
            CronService->>MongoDB: Set status to 'police_notified'
        end
    end
    
    Note over CronScheduler: Daily at 10:00 AM
    
    CronScheduler->>CronService: Auto-mark Expired
    CronService->>MongoDB: Find expired & active
    MongoDB-->>CronService: List of Extinguishers
    loop For Each Extinguisher
        CronService->>MongoDB: Set status to 'expired'
    end
```

## Frontend Component Structure

```mermaid
graph TB
    subgraph "Pages"
        Login[Login Page]
        VerifyOTP[Verify OTP Page]
        Dashboard[Dashboard Page]
        ExtinguishersList[Extinguishers List]
        ExtinguisherDetail[Extinguisher Detail]
        ExtinguisherNew[New Extinguisher]
        ExtinguisherEdit[Edit Extinguisher]
    end
    
    subgraph "Components"
        Button[Button]
        Input[Input]
        Textarea[Textarea]
        Modal[Modal]
        Badge[Badge]
        Pagination[Pagination]
        OtpInput[OTP Input]
        StatsCards[Stats Cards]
        ExtinguisherTable[Extinguisher Table]
        ExtinguisherForm[Extinguisher Form]
        Header[Header]
        Sidebar[Sidebar]
    end
    
    subgraph "Context & Hooks"
        AuthContext[Auth Context]
        useAuth[useAuth Hook]
        useDebounce[useDebounce Hook]
    end
    
    subgraph "Services"
        AuthService[Auth Service]
        ExtinguisherService[Extinguisher Service]
        DashboardService[Dashboard Service]
    end
    
    subgraph "Validations"
        LoginSchema[Login Schema]
        OtpSchema[OTP Schema]
        ExtinguisherSchema[Extinguisher Schema]
    end
    
    Login --> AuthService
    VerifyOTP --> AuthService
    Dashboard --> DashboardService
    Dashboard --> StatsCards
    ExtinguishersList --> ExtinguisherService
    ExtinguishersList --> ExtinguisherTable
    ExtinguishersList --> Pagination
    ExtinguisherDetail --> ExtinguisherService
    ExtinguisherNew --> ExtinguisherService
    ExtinguisherNew --> ExtinguisherForm
    ExtinguisherEdit --> ExtinguisherService
    ExtinguisherEdit --> ExtinguisherForm
    
    ExtinguisherForm --> ExtinguisherSchema
    Login --> LoginSchema
    VerifyOTP --> OtpSchema
    VerifyOTP --> OtpInput
    
    Dashboard --> useAuth
    ExtinguishersList --> useAuth
    ExtinguisherDetail --> useAuth
    ExtinguisherNew --> useAuth
    ExtinguisherEdit --> useAuth
    
    Header --> AuthContext
    Sidebar --> AuthContext
```

## Status Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> Active: Created
    Active --> Expired: Expiration Date Passed
    Active --> Reported: Marked by Admin
    Expired --> PoliceNotified: 7+ Days Expired
    Reported --> Active: Reinstated
    PoliceNotified --> [*]: Resolved
```

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OTP
- **Email**: Nodemailer
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Scheduling**: node-cron
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **Forms**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: react-hot-toast
- **Type Safety**: TypeScript

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/fire-extinguisher
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-password
POLICE_EMAIL=police@example.com
ADMIN_EMAIL=admin@example.com
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Security Features

1. **Authentication**: JWT-based authentication with OTP verification
2. **Rate Limiting**: Login attempts limited to 5 per 15 minutes
3. **Input Validation**: Server-side validation with express-validator
4. **Client-side Validation**: Zod schemas for form validation
5. **CORS**: Configured to allow only frontend origin
6. **Helmet**: Security headers for Express
7. **Password Hashing**: Bcrypt for secure password storage
8. **Token Storage**: JWT tokens stored in localStorage with proper management

## Compliance Automation

1. **30-Day Warning**: Automatic email 30 days before expiry
2. **7-Day Reminder**: Follow-up reminder 7 days before expiry
3. **Police Escalation**: Automatic police notification 7 days after expiry
4. **Auto-Status Update**: Automatic status change to 'expired' when date passes
5. **Audit Trail**: Timestamps for all alerts and notifications

## Deployment Considerations

1. **Database**: Use MongoDB Atlas for production
2. **Email**: Use production SMTP service (SendGrid, AWS SES, etc.)
3. **Environment**: Separate configs for development/staging/production
4. **Monitoring**: Implement logging and monitoring (e.g., Winston, Sentry)
5. **Backup**: Regular database backups
6. **HTTPS**: SSL/TLS certificates for production
7. **Scaling**: Consider load balancing for high traffic
