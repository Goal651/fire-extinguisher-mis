"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  LayoutGrid, Flame, ClipboardList, AlertTriangle, Wrench,
} from "lucide-react";

import { useAuthContext } from "@/context/AuthContext";
import { reportService } from "@/services/reportService";
import type {
  Period,
  SummaryReportData,
  StockReportData,
  InspectionReportData,
  ExpiredReportData,
  MaintenanceReportData,
} from "@/types/reports";

// ── Constants ────────────────────────────────────────────────────────────────

type TabId = "summary" | "stock" | "inspections" | "expired" | "maintenance";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "summary",      label: "Summary",     icon: <LayoutGrid size={14} /> },
  { id: "stock",        label: "Stock",        icon: <Flame size={14} /> },
  { id: "inspections",  label: "Inspections",  icon: <ClipboardList size={14} /> },
  { id: "expired",      label: "Expired",      icon: <AlertTriangle size={14} /> },
  { id: "maintenance",  label: "Maintenance",  icon: <Wrench size={14} /> },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: "daily",   label: "Last 30 days" },
  { value: "monthly", label: "Last 12 months" },
  { value: "yearly",  label: "Last 5 years" },
];

const CHART_COLORS = {
  primary:  "#2f2f2f",
  active:   "#2e7d32",
  expired:  "#d32f2f",
  reported: "#f59e0b",
  police:   "#b71c1c",
  pending:  "#e65100",
  pass:     "#2e7d32",
  fail:     "#d32f2f",
  scheduled:"#1976d2",
  completed:"#2e7d32",
  none:     "#9e9e9e",
};

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { admin } = useAuthContext();
  const router = useRouter();

  const [tab, setTab]       = useState<TabId>("summary");
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState(false);

  const [summary,     setSummary]     = useState<SummaryReportData | null>(null);
  const [stock,       setStock]       = useState<StockReportData | null>(null);
  const [inspections, setInspections] = useState<InspectionReportData | null>(null);
  const [expired,     setExpired]     = useState<ExpiredReportData | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceReportData | null>(null);

  useEffect(() => {
    if (admin && admin.role === "user") router.push("/dashboard");
  }, [admin, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "summary") {
        const r = await reportService.getSummary(period);
        setSummary(r.data);
      } else if (tab === "stock") {
        const r = await reportService.getStock(period);
        setStock(r.data);
      } else if (tab === "inspections") {
        const r = await reportService.getInspections(period);
        setInspections(r.data);
      } else if (tab === "expired") {
        const r = await reportService.getExpired(period);
        setExpired(r.data);
      } else if (tab === "maintenance") {
        const r = await reportService.getMaintenance(period);
        setMaintenance(r.data);
      }
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [tab, period]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2f2f2f" }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: "#999" }}>
            Analytics and trends across extinguisher data.
          </p>
        </div>

        {/* Period selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="form-select w-44"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto"
        style={{ backgroundColor: "#f4f4f4" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0"
            style={{
              backgroundColor: tab === t.id ? "#ffffff" : "transparent",
              color:            tab === t.id ? "#2f2f2f" : "#666",
              boxShadow:        tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {tab === "summary"     && summary     && <SummaryTab     data={summary} />}
          {tab === "stock"       && stock       && <StockTab       data={stock} />}
          {tab === "inspections" && inspections && <InspectionsTab data={inspections} />}
          {tab === "expired"     && expired     && <ExpiredTab     data={expired} />}
          {tab === "maintenance" && maintenance && <MaintenanceTab data={maintenance} />}
        </>
      )}
    </div>
  );
}

// ── Tab: Summary ─────────────────────────────────────────────────────────────

function SummaryTab({ data }: { data: SummaryReportData }) {
  const kpis = [
    { label: "Total Extinguishers", value: data.stock.total            ?? 0, color: CHART_COLORS.primary },
    { label: "Active",              value: data.stock.active           ?? 0, color: CHART_COLORS.active },
    { label: "Expired",             value: data.stock.expired          ?? 0, color: CHART_COLORS.expired },
    { label: "Police Notified",     value: data.stock.policeNotified   ?? 0, color: CHART_COLORS.police },
    { label: "Inspections Done",    value: data.inspections.completed  ?? 0, color: CHART_COLORS.pass },
    { label: "Pass Rate",           value: `${data.inspections.passRate ?? 0}%`, color: CHART_COLORS.pass },
    { label: "Pending Maintenance", value: data.maintenance.scheduled  ?? 0, color: CHART_COLORS.scheduled },
    { label: "Maintenance Done",    value: data.maintenance.completed  ?? 0, color: CHART_COLORS.completed },
  ];

  const stockPie = [
    { name: "Active",          value: data.stock.active,         fill: CHART_COLORS.active },
    { name: "Expired",         value: data.stock.expired,        fill: CHART_COLORS.expired },
    { name: "Reported",        value: data.stock.reported,       fill: CHART_COLORS.reported },
    { name: "Police Notified", value: data.stock.policeNotified, fill: CHART_COLORS.police },
  ].filter((d) => d.value > 0);

  const inspPie = [
    { name: "Passed", value: data.inspections.passed, fill: CHART_COLORS.pass },
    { name: "Failed", value: data.inspections.failed, fill: CHART_COLORS.fail },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5">
      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} color={k.color} />
        ))}
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Stock by Status">
          {stockPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stockPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} labelLine={false}>
                  {stockPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Inspection Results">
          {inspPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={inspPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} labelLine={false}>
                  {inspPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>
    </div>
  );
}

// ── Tab: Stock ───────────────────────────────────────────────────────────────

function StockTab({ data }: { data: StockReportData }) {
  const breakdown = [
    { label: "Active",          value: data.active,         color: CHART_COLORS.active },
    { label: "Expired",         value: data.expired,        color: CHART_COLORS.expired },
    { label: "Reported",        value: data.reported,       color: CHART_COLORS.reported },
    { label: "Police Notified", value: data.policeNotified, color: CHART_COLORS.police },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total" value={data.total} color={CHART_COLORS.primary} />
        {breakdown.map((b) => <KpiCard key={b.label} label={b.label} value={b.value} color={b.color} />)}
      </div>

      <ChartCard title="Stock Trend">
        {data.trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.trend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
              <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} name="Records" />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </ChartCard>

      <ChartCard title="Status Distribution">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={breakdown} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
            <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {breakdown.map((b, i) => <Cell key={i} fill={b.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── Tab: Inspections ─────────────────────────────────────────────────────────

function InspectionsTab({ data }: { data: InspectionReportData }) {
  const breakdown = [
    { label: "None",      value: data.none,      color: CHART_COLORS.none },
    { label: "Pending",   value: data.pending,   color: CHART_COLORS.pending },
    { label: "Completed", value: data.completed, color: CHART_COLORS.completed },
  ];

  const results = [
    { label: "Passed", value: data.passed, fill: CHART_COLORS.pass },
    { label: "Failed", value: data.failed, fill: CHART_COLORS.fail },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total"     value={data.total}     color={CHART_COLORS.primary} />
        <KpiCard label="None"      value={data.none}      color={CHART_COLORS.none} />
        <KpiCard label="Pending"   value={data.pending}   color={CHART_COLORS.pending} />
        <KpiCard label="Completed" value={data.completed} color={CHART_COLORS.completed} />
        <KpiCard label="Passed"    value={data.passed}    color={CHART_COLORS.pass} />
        <KpiCard label="Pass Rate" value={`${data.passRate ?? 0}%`} color={CHART_COLORS.pass} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Inspection Trend">
          {data.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.trend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Pass / Fail">
          {results.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={results} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} labelLine={false}>
                  {results.map((r, i) => <Cell key={i} fill={r.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      <ChartCard title="Status Breakdown">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={breakdown} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
            <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {breakdown.map((b, i) => <Cell key={i} fill={b.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── Tab: Expired ─────────────────────────────────────────────────────────────

function ExpiredTab({ data }: { data: ExpiredReportData }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total Expired"    value={data.totalExpired}   color={CHART_COLORS.expired} />
        <KpiCard label="Police Notified"  value={data.policeNotified} color={CHART_COLORS.police} />
      </div>

      <ChartCard title="Expiry Trend">
        {data.trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.trend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
              <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill={CHART_COLORS.expired} radius={[4, 4, 0, 0]} name="Expired" />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </ChartCard>

      {data.records?.length > 0 && (
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "#d2d2d2" }}>
            <p className="text-sm font-semibold" style={{ color: "#2f2f2f" }}>
              Expired Records ({data.records.length})
            </p>
          </div>
          <div className="table-wrap">
            <table className="data-table px-5">
              <thead>
                <tr>
                  <th className="pl-5">Ext. ID</th>
                  <th>Owner</th>
                  <th className="hidden sm:table-cell">Email</th>
                  <th>Expired</th>
                  <th>Days Overdue</th>
                  <th className="pr-5 hidden md:table-cell">Police Notified</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r._id}>
                    <td className="pl-5 font-mono text-xs font-semibold" style={{ color: "#2f2f2f" }}>
                      {r.extinguisherId}
                    </td>
                    <td className="text-sm" style={{ color: "#666" }}>{r.ownerName}</td>
                    <td className="hidden sm:table-cell text-sm" style={{ color: "#666" }}>{r.ownerEmail}</td>
                    <td className="text-sm" style={{ color: "#d32f2f" }}>
                      {new Date(r.expirationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded-full"
                        style={{ backgroundColor: "#ffeaea", color: "#d32f2f" }}
                      >
                        {r.daysSinceExpiry}d
                      </span>
                    </td>
                    <td className="pr-5 hidden md:table-cell text-sm" style={{ color: "#666" }}>
                      {r.policeNotifiedAt ? new Date(r.policeNotifiedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Maintenance ─────────────────────────────────────────────────────────

function MaintenanceTab({ data }: { data: MaintenanceReportData }) {
  const breakdown = [
    { label: "None",      value: data.none,      color: CHART_COLORS.none },
    { label: "Scheduled", value: data.scheduled, color: CHART_COLORS.scheduled },
    { label: "Completed", value: data.completed, color: CHART_COLORS.completed },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total"     value={data.total}     color={CHART_COLORS.primary} />
        <KpiCard label="None"      value={data.none}      color={CHART_COLORS.none} />
        <KpiCard label="Scheduled" value={data.scheduled} color={CHART_COLORS.scheduled} />
        <KpiCard label="Completed" value={data.completed} color={CHART_COLORS.completed} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Maintenance Trend">
          {data.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.trend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke={CHART_COLORS.scheduled} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Status Breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={breakdown} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
              <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {breakdown.map((b, i) => <Cell key={i} fill={b.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {data.records?.length > 0 && (
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "#d2d2d2" }}>
            <p className="text-sm font-semibold" style={{ color: "#2f2f2f" }}>
              Records ({data.records.length})
            </p>
          </div>
          <div className="table-wrap">
            <table className="data-table px-5">
              <thead>
                <tr>
                  <th className="pl-5">Ext. ID</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Scheduled Date</th>
                  <th className="pr-5 hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => {
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    scheduled: { bg: "#eaf6ff", text: "#1976d2" },
                    completed: { bg: "#e8f5e9", text: "#2e7d32" },
                    none:      { bg: "#f3f4f6", text: "#666" },
                  };
                  const sc = statusColors[r.maintenanceStatus] ?? statusColors.none;
                  return (
                    <tr key={r._id}>
                      <td className="pl-5 font-mono text-xs font-semibold" style={{ color: "#2f2f2f" }}>
                        {r.extinguisherId}
                      </td>
                      <td className="text-sm" style={{ color: "#666" }}>{r.ownerName}</td>
                      <td>
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-full capitalize"
                          style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {r.maintenanceStatus}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell text-sm" style={{ color: "#666" }}>
                        {r.scheduledMaintenanceDate
                          ? new Date(r.scheduledMaintenanceDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="pr-5 hidden md:table-cell text-sm" style={{ color: "#666" }}>
                        {r.maintenanceNotes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: color + "0d", borderColor: color + "33" }}>
      <p className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color }}>
        {label}
      </p>
      <p className="text-2xl font-bold mt-2 leading-none" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-4">
      <p className="text-sm font-semibold" style={{ color: "#2f2f2f" }}>{title}</p>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-40 rounded-lg" style={{ backgroundColor: "#f8f8f8" }}>
      <p className="text-sm" style={{ color: "#999" }}>No data for this period</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 border h-20" style={{ backgroundColor: "#f8f8f8", borderColor: "#e8e8e8" }} />
        ))}
      </div>
      <div className="card h-72" style={{ backgroundColor: "#f8f8f8" }} />
    </div>
  );
}
