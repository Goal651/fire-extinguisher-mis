export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "inspector";
}

export type ExtinguisherStatus =
  | "active"
  | "expired"
  | "reported"
  | "police_notified";

export interface IInspectionLog {
  _id?: string;
  inspectedAt: string;
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
  status: ExtinguisherStatus;
  alertSentAt: string | null;
  reminderSentAt: string | null;
  policeNotifiedAt: string | null;
  notes: string;
  // Inspection & Maintenance fields
  scheduledInspectionDate?: string | null;
  inspectionStatus?: "none" | "pending" | "completed";
  scheduledMaintenanceDate?: string | null;
  maintenanceStatus?: "none" | "scheduled" | "completed";
  maintenanceNotes?: string;
  inspectionLogs: IInspectionLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
