import api from "@/lib/axios";
import type {
  Period,
  SummaryReportResponse,
  StockReportResponse,
  InspectionReportResponse,
  ExpiredReportResponse,
  MaintenanceReportResponse,
} from "@/types/reports";

const base = "/reports";

export const reportService = {
  getSummary: (period: Period = "monthly") =>
    api.get<SummaryReportResponse>(`${base}/summary`, { params: { period } }).then((r) => r.data),

  getStock: (period: Period = "monthly") =>
    api.get<StockReportResponse>(`${base}/stock`, { params: { period } }).then((r) => r.data),

  getInspections: (period: Period = "monthly") =>
    api.get<InspectionReportResponse>(`${base}/inspections`, { params: { period } }).then((r) => r.data),

  getExpired: (period: Period = "monthly") =>
    api.get<ExpiredReportResponse>(`${base}/expired`, { params: { period } }).then((r) => r.data),

  getMaintenance: (period: Period = "monthly") =>
    api.get<MaintenanceReportResponse>(`${base}/maintenance`, { params: { period } }).then((r) => r.data),
};
