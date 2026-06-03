export interface Admin {
  _id: string;
  name: string;
  email: string;
}

export type ExtinguisherStatus =
  | "active"
  | "expired"
  | "reported"
  | "police_notified";

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

  createdAt: string;

  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
