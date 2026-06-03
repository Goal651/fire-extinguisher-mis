import api from "@/lib/axios";
import type {
  Period,
  SummaryReportData,
  SummaryReportResponse,
  StockReportData,
  StockReportResponse,
  InspectionReportData,
  InspectionReportResponse,
  ExpiredReportData,
  ExpiredReportResponse,
  MaintenanceReportData,
  MaintenanceReportResponse,
} from "@/types/reports";

const base = "/reports";

// ── Normalizers ──────────────────────────────────────────────────────────────
// Backend may return snake_case or camelCase — handle both.

function normalizeStock(d: any): StockReportData {
  return {
    total:          d?.total          ?? 0,
    active:         d?.active         ?? 0,
    expired:        d?.expired        ?? 0,
    reported:       d?.reported       ?? 0,
    policeNotified: d?.policeNotified ?? d?.police_notified ?? d?.policenotified ?? 0,
    trend:          d?.trend          ?? [],
  };
}

function normalizeInspections(d: any): InspectionReportData {
  return {
    total:     d?.total     ?? 0,
    none:      d?.none      ?? 0,
    pending:   d?.pending   ?? 0,
    completed: d?.completed ?? 0,
    passed:    d?.passed    ?? 0,
    failed:    d?.failed    ?? 0,
    passRate:  d?.passRate  ?? d?.pass_rate  ?? d?.passrate  ?? 0,
    trend:     d?.trend     ?? [],
  };
}

function normalizeExpired(d: any): ExpiredReportData {
  return {
    totalExpired:   d?.totalExpired   ?? d?.total_expired   ?? d?.total   ?? 0,
    policeNotified: d?.policeNotified ?? d?.police_notified ?? 0,
    trend:          d?.trend          ?? [],
    records:        d?.records        ?? [],
  };
}

function normalizeMaintenance(d: any): MaintenanceReportData {
  return {
    total:     d?.total     ?? 0,
    none:      d?.none      ?? 0,
    scheduled: d?.scheduled ?? 0,
    completed: d?.completed ?? 0,
    trend:     d?.trend     ?? [],
    records:   d?.records   ?? [],
  };
}

function normalizeSummary(d: any): SummaryReportData {
  return {
    stock:        normalizeStock(d?.stock),
    inspections:  normalizeInspections(d?.inspections),
    expired:      normalizeExpired(d?.expired),
    maintenance:  normalizeMaintenance(d?.maintenance),
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const reportService = {
  getSummary: async (period: Period = "monthly"): Promise<SummaryReportResponse> => {
    const r = await api.get(`${base}/summary`, { params: { period } });
    const raw = r.data?.data ?? r.data;
    return { success: true, data: normalizeSummary(raw) };
  },

  getStock: async (period: Period = "monthly"): Promise<StockReportResponse> => {
    const r = await api.get(`${base}/stock`, { params: { period } });
    const raw = r.data?.data ?? r.data;
    return { success: true, data: normalizeStock(raw) };
  },

  getInspections: async (period: Period = "monthly"): Promise<InspectionReportResponse> => {
    const r = await api.get(`${base}/inspections`, { params: { period } });
    const raw = r.data?.data ?? r.data;
    return { success: true, data: normalizeInspections(raw) };
  },

  getExpired: async (period: Period = "monthly"): Promise<ExpiredReportResponse> => {
    const r = await api.get(`${base}/expired`, { params: { period } });
    const raw = r.data?.data ?? r.data;
    return { success: true, data: normalizeExpired(raw) };
  },

  getMaintenance: async (period: Period = "monthly"): Promise<MaintenanceReportResponse> => {
    const r = await api.get(`${base}/maintenance`, { params: { period } });
    const raw = r.data?.data ?? r.data;
    return { success: true, data: normalizeMaintenance(raw) };
  },
};
