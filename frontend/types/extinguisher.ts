
export enum FireExtinguisherType {
    WATER = "WATER",
    CO2 = "CO2",
    FOAM = "FOAM",
    DRY_CHEMICAL = "DRY_CHEMICAL"
}

export enum FireExtinguisherSize {
    "2.5LBS" = "2.5LBS",
    "5LBS" = "5LBS",
    "9LBS" = "9LBS",
    "12LBS" = "12LBS"
}

export interface InspectionLog {
    inspectedAt: Date;
    inspectorId: string;
    result: "pass" | "fail";
    notes?: string;
}

export interface FireExtinguisher {
    _id: string;
    extinguisherId: string;
    ownerName: string;
    ownerIdNumber: string;
    ownerEmail: string;
    ownerPhone: string;
    dateOfIssue: string;
    expirationDate: string;
    status: "active" | "expired" | "reported" | "police_notified";
    alertSentAt?: string | null;
    reminderSentAt?: string | null;
    policeNotifiedAt?: string | null;
    notes?: string;
    // Inspection & Maintenance fields
    scheduledInspectionDate?: string | null;
    inspectionStatus?: "none" | "pending" | "completed";
    scheduledMaintenanceDate?: string | null;
    maintenanceStatus?: "none" | "scheduled" | "completed";
    maintenanceNotes?: string;
    inspectionLogs: InspectionLog[];
    createdAt: string;
    updatedAt: string;
}