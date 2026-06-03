export type Period = "daily" | "monthly" | "yearly";

export interface PeriodBucket {
  label: string;
  count: number;
}

// ── Stock ──────────────────────────────────────────────────────────────────
export interface StockReportData {
  total: number;
  active: number;
  expired: number;
  reported: number;
  policeNotified: number;
  trend: PeriodBucket[];
}

export interface StockReportResponse {
  success: boolean;
  data: StockReportData;
}

// ── Inspections ────────────────────────────────────────────────────────────
export interface InspectionReportData {
  total: number;
  none: number;
  pending: number;
  completed: number;
  passed: number;
  failed: number;
  passRate: number;
  trend: PeriodBucket[];
}

export interface InspectionReportResponse {
  success: boolean;
  data: InspectionReportData;
}

// ── Expired ────────────────────────────────────────────────────────────────
export interface ExpiredRecord {
  _id: string;
  extinguisherId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  expirationDate: string;
  status: string;
  policeNotifiedAt?: string | null;
  daysSinceExpiry: number;
}

export interface ExpiredReportData {
  totalExpired: number;
  policeNotified: number;
  trend: PeriodBucket[];
  records: ExpiredRecord[];
}

export interface ExpiredReportResponse {
  success: boolean;
  data: ExpiredReportData;
}

// ── Maintenance ────────────────────────────────────────────────────────────
export interface MaintenanceRecord {
  _id: string;
  extinguisherId: string;
  ownerName: string;
  maintenanceStatus: string;
  scheduledMaintenanceDate?: string | null;
  maintenanceNotes?: string;
}

export interface MaintenanceReportData {
  total: number;
  none: number;
  scheduled: number;
  completed: number;
  trend: PeriodBucket[];
  records: MaintenanceRecord[];
}

export interface MaintenanceReportResponse {
  success: boolean;
  data: MaintenanceReportData;
}

// ── Summary ────────────────────────────────────────────────────────────────
export interface SummaryReportData {
  stock: Omit<StockReportData, "trend">;
  inspections: Omit<InspectionReportData, "trend">;
  expired: Omit<ExpiredReportData, "trend" | "records">;
  maintenance: Omit<MaintenanceReportData, "trend" | "records">;
}

export interface SummaryReportResponse {
  success: boolean;
  data: SummaryReportData;
}
