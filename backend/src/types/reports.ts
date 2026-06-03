// ─────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────

export type Period = "daily" | "monthly" | "yearly";

export interface PeriodBucket {
  /** Human-readable label: e.g. "2025-06-03", "2025-06", "2025" */
  label: string;
  count: number;
}

// ─────────────────────────────────────────────────────────────
// 1. Stock Report  –  GET /api/reports/stock
// ─────────────────────────────────────────────────────────────

export interface StockBreakdown {
  active: number;
  expired: number;
  reported: number;
  police_notified: number;
}

export interface StockReportData {
  total: number;
  breakdown: StockBreakdown;
  /** Trend bucketed by the requested period */
  trend: PeriodBucket[];
}

export interface StockReportResponse {
  success: boolean;
  period: Period;
  data: StockReportData;
}

// ─────────────────────────────────────────────────────────────
// 2. Inspection Status Report  –  GET /api/reports/inspections
// ─────────────────────────────────────────────────────────────

export interface InspectionStatusBreakdown {
  none: number;
  pending: number;
  completed: number;
}

export interface InspectionResultBreakdown {
  pass: number;
  fail: number;
}

export interface InspectionTrendBucket extends PeriodBucket {
  pass: number;
  fail: number;
}

export interface InspectionReportData {
  totalInspectionsLogged: number;
  statusBreakdown: InspectionStatusBreakdown;
  resultBreakdown: InspectionResultBreakdown;
  passRate: number;          // percentage 0-100, rounded to 2 dp
  trend: InspectionTrendBucket[];
}

export interface InspectionReportResponse {
  success: boolean;
  period: Period;
  data: InspectionReportData;
}

// ─────────────────────────────────────────────────────────────
// 3. Expired Extinguishers Report  –  GET /api/reports/expired
// ─────────────────────────────────────────────────────────────

export interface ExpiredExtinguisherItem {
  _id: string;
  extinguisherId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  expirationDate: string;   // ISO date string
  status: string;
  daysSinceExpiry: number;
  policeNotified: boolean;
  policeNotifiedAt: string | null;
}

export interface ExpiredReportData {
  total: number;
  policeNotifiedCount: number;
  trend: PeriodBucket[];
  records: ExpiredExtinguisherItem[];
}

export interface ExpiredReportResponse {
  success: boolean;
  period: Period;
  data: ExpiredReportData;
}

// ─────────────────────────────────────────────────────────────
// 4. Maintenance History Report  –  GET /api/reports/maintenance
// ─────────────────────────────────────────────────────────────

export interface MaintenanceStatusBreakdown {
  none: number;
  scheduled: number;
  completed: number;
}

export interface MaintenanceHistoryItem {
  _id: string;
  extinguisherId: string;
  ownerName: string;
  scheduledMaintenanceDate: string | null;
  maintenanceStatus: string;
  maintenanceNotes: string | null;
  updatedAt: string;
}

export interface MaintenanceReportData {
  statusBreakdown: MaintenanceStatusBreakdown;
  trend: PeriodBucket[];
  records: MaintenanceHistoryItem[];
}

export interface MaintenanceReportResponse {
  success: boolean;
  period: Period;
  data: MaintenanceReportData;
}

// ─────────────────────────────────────────────────────────────
// 5. Summary Report  –  GET /api/reports/summary
//    Single endpoint that returns all four reports in one call
// ─────────────────────────────────────────────────────────────

export interface SummaryReportData {
  stock: StockReportData;
  inspections: InspectionReportData;
  expired: Omit<ExpiredReportData, "records">;  // no full record list in summary
  maintenance: Omit<MaintenanceReportData, "records">;
}

export interface SummaryReportResponse {
  success: boolean;
  period: Period;
  generatedAt: string;  // ISO timestamp
  data: SummaryReportData;
}
