
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
    extinguisherId: string;
    ownerName: string;
    ownerIdNumber: string;
    ownerEmail: string;
    ownerPhone: string;
    dateOfIssue: Date;
    expirationDate: Date;
    status: "active" | "expired" | "reported" | "police_notified";
    alertSentAt?: Date | null;
    reminderSentAt?: Date | null;
    policeNotifiedAt?: Date | null;
    notes?: string;
    // Inspection & Maintenance fields
    scheduledInspectionDate?: Date | null;
    inspectionStatus?: "none" | "pending" | "completed";
    scheduledMaintenanceDate?: Date | null;
    maintenanceStatus?: "none" | "scheduled" | "completed";
    maintenanceNotes?: string;
    inspectionLogs: InspectionLog[];
    createdAt: Date;
    updatedAt: Date;
}