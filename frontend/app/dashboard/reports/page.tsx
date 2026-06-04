"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { LayoutGrid, Flame, ClipboardList, AlertTriangle, Wrench, Download, FileText } from "lucide-react";

import { useAuthContext } from "@/context/AuthContext";
import { reportService } from "@/services/reportService";
import { exportCSV, exportPDF, kpiHtml, tableHtml } from "@/lib/exportUtils";
import type {
  Period,
  SummaryReportData,
  StockReportData,
  InspectionReportData,
  ExpiredReportData,
  MaintenanceReportData,
} from "@/types/reports";
import Button from "@/components/ui/Button";

// ── Constants ────────────────────────────────────────────────────────────────

type TabId = "summary" | "stock" | "inspections" | "expired" | "maintenance";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "summary",     label: "Summary",     icon: <LayoutGrid size={14} /> },
  { id: "stock",       label: "Stock",       icon: <Flame size={14} /> },
  { id: "inspections", label: "Inspections", icon: <ClipboardList size={14} /> },
  { id: "expired",     label: "Expired",     icon: <AlertTriangle size={14} /> },
  { id: "maintenance", label: "Maintenance", icon: <Wrench size={14} /> },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: "daily",   label: "Last 30 days" },
  { value: "monthly", label: "Last 12 months" },
  { value: "yearly",  label: "Last 5 years" },
];

const C = {
  primary:   "#2f2f2f",
  active:    "#2e7d32",
  expired:   "#d32f2f",
  reported:  "#f59e0b",
  police:    "#b71c1c",
  pending:   "#e65100",
  pass:      "#2e7d32",
  fail:      "#d32f2f",
  scheduled: "#1976d2",
  completed: "#2e7d32",
  none:      "#9e9e9e",
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
      if (tab === "summary")     { const r = await reportService.getSummary(period);     setSummary(r.data); }
      else if (tab === "stock")       { const r = await reportService.getStock(period);       setStock(r.data); }
      else if (tab === "inspections") { const r = await reportService.getInspections(period); setInspections(r.data); }
      else if (tab === "expired")     { const r = await reportService.getExpired(period);     setExpired(r.data); }
      else if (tab === "maintenance") { const r = await reportService.getMaintenance(period); setMaintenance(r.data); }
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [tab, period]);

  useEffect(() => { load(); }, [load]);

  // ── Export handlers ────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    const filename = `fireguard-${tab}-${period}-${new Date().toISOString().slice(0,10)}`;
    if (tab === "summary" && summary) {
      exportCSV(filename, [
        { Metric: "Total Extinguishers", Value: summary.stock.total ?? 0 },
        { Metric: "Active",              Value: summary.stock.active ?? 0 },
        { Metric: "Expired",             Value: summary.stock.expired ?? 0 },
        { Metric: "Police Notified",     Value: summary.stock.policeNotified ?? 0 },
        { Metric: "Inspections Done",    Value: summary.inspections.completed ?? 0 },
        { Metric: "Pass Rate",           Value: `${summary.inspections.passRate ?? 0}%` },
        { Metric: "Pending Maintenance", Value: summary.maintenance.scheduled ?? 0 },
        { Metric: "Maintenance Done",    Value: summary.maintenance.completed ?? 0 },
      ]);
    } else if (tab === "stock" && stock) {
      exportCSV(filename, [
        { Metric: "Total",          Value: stock.total ?? 0 },
        { Metric: "Active",         Value: stock.active ?? 0 },
        { Metric: "Expired",        Value: stock.expired ?? 0 },
        { Metric: "Reported",       Value: stock.reported ?? 0 },
        { Metric: "Police Notified",Value: stock.policeNotified ?? 0 },
        ...(stock.trend ?? []).map((t) => ({ Metric: `Trend: ${t.label}`, Value: t.count })),
      ]);
    } else if (tab === "inspections" && inspections) {
      exportCSV(filename, [
        { Metric: "Total",     Value: inspections.total ?? 0 },
        { Metric: "Pending",   Value: inspections.pending ?? 0 },
        { Metric: "Completed", Value: inspections.completed ?? 0 },
        { Metric: "Passed",    Value: inspections.passed ?? 0 },
        { Metric: "Failed",    Value: inspections.failed ?? 0 },
        { Metric: "Pass Rate", Value: `${inspections.passRate ?? 0}%` },
        ...(inspections.trend ?? []).map((t) => ({ Metric: `Trend: ${t.label}`, Value: t.count })),
      ]);
    } else if (tab === "expired" && expired) {
      exportCSV(filename, (expired.records ?? []).map((r) => ({
        "Ext. ID":        r.extinguisherId,
        "Owner":          r.ownerName,
        "Email":          r.ownerEmail,
        "Phone":          r.ownerPhone,
        "Expired On":     new Date(r.expirationDate).toLocaleDateString(),
        "Days Overdue":   r.daysSinceExpiry,
        "Status":         r.status,
        "Police Notified":r.policeNotifiedAt ? new Date(r.policeNotifiedAt).toLocaleDateString() : "No",
      })));
    } else if (tab === "maintenance" && maintenance) {
      exportCSV(filename, (maintenance.records ?? []).map((r) => ({
        "Ext. ID":         r.extinguisherId,
        "Owner":           r.ownerName,
        "Status":          r.maintenanceStatus,
        "Scheduled Date":  r.scheduledMaintenanceDate ? new Date(r.scheduledMaintenanceDate).toLocaleDateString() : "—",
        "Notes":           r.maintenanceNotes ?? "",
      })));
    }
  };

  const handleExportPDF = () => {
    const title = `FireGuard — ${tab.charAt(0).toUpperCase() + tab.slice(1)} Report (${period})`;
    let html = "";

    if (tab === "summary" && summary) {
      html = kpiHtml([
        { label: "Total",            value: summary.stock.total ?? 0 },
        { label: "Active",           value: summary.stock.active ?? 0 },
        { label: "Expired",          value: summary.stock.expired ?? 0 },
        { label: "Police Notified",  value: summary.stock.policeNotified ?? 0 },
        { label: "Inspections Done", value: summary.inspections.completed ?? 0 },
        { label: "Pass Rate",        value: `${summary.inspections.passRate ?? 0}%` },
        { label: "Pending Maint.",   value: summary.maintenance.scheduled ?? 0 },
        { label: "Maint. Done",      value: summary.maintenance.completed ?? 0 },
      ]);
    } else if (tab === "stock" && stock) {
      html = kpiHtml([
        { label: "Total",          value: stock.total ?? 0 },
        { label: "Active",         value: stock.active ?? 0 },
        { label: "Expired",        value: stock.expired ?? 0 },
        { label: "Reported",       value: stock.reported ?? 0 },
        { label: "Police Notified",value: stock.policeNotified ?? 0 },
      ]);
      if (stock.trend?.length) {
        html += `<p class="section-title">Trend</p>` +
          tableHtml(["Period", "Count"], (stock.trend ?? []).map((t) => [t.label, t.count]));
      }
    } else if (tab === "inspections" && inspections) {
      html = kpiHtml([
        { label: "Total",     value: inspections.total ?? 0 },
        { label: "Pending",   value: inspections.pending ?? 0 },
        { label: "Completed", value: inspections.completed ?? 0 },
        { label: "Passed",    value: inspections.passed ?? 0 },
        { label: "Failed",    value: inspections.failed ?? 0 },
        { label: "Pass Rate", value: `${inspections.passRate ?? 0}%` },
      ]);
      if (inspections.trend?.length) {
        html += `<p class="section-title">Trend</p>` +
          tableHtml(["Period", "Count"], (inspections.trend ?? []).map((t) => [t.label, t.count]));
      }
    } else if (tab === "expired" && expired) {
      html = kpiHtml([
        { label: "Total Expired",   value: expired.totalExpired ?? 0 },
        { label: "Police Notified", value: expired.policeNotified ?? 0 },
      ]);
      if (expired.records?.length) {
        html += `<p class="section-title">Expired Records</p>` +
          tableHtml(
            ["Ext. ID", "Owner", "Email", "Expired On", "Days Overdue", "Police Notified"],
            (expired.records ?? []).map((r) => [
              r.extinguisherId, r.ownerName, r.ownerEmail,
              new Date(r.expirationDate).toLocaleDateString(),
              `${r.daysSinceExpiry}d`,
              r.policeNotifiedAt ? new Date(r.policeNotifiedAt).toLocaleDateString() : "No",
            ]),
          );
      }
    } else if (tab === "maintenance" && maintenance) {
      html = kpiHtml([
        { label: "Total",     value: maintenance.total ?? 0 },
        { label: "Scheduled", value: maintenance.scheduled ?? 0 },
        { label: "Completed", value: maintenance.completed ?? 0 },
        { label: "None",      value: maintenance.none ?? 0 },
      ]);
      if (maintenance.records?.length) {
        html += `<p class="section-title">Records</p>` +
          tableHtml(
            ["Ext. ID", "Owner", "Status", "Scheduled Date", "Notes"],
            (maintenance.records ?? []).map((r) => [
              r.extinguisherId, r.ownerName, r.maintenanceStatus,
              r.scheduledMaintenanceDate ? new Date(r.scheduledMaintenanceDate).toLocaleDateString() : "—",
              r.maintenanceNotes ?? "—",
            ]),
          );
      }
    }

    exportPDF(title, html);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const hasData =
    (tab === "summary"     && !!summary)     ||
    (tab === "stock"       && !!stock)       ||
    (tab === "inspections" && !!inspections) ||
    (tab === "expired"     && !!expired)     ||
    (tab === "maintenance" && !!maintenance);

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

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export buttons — only when data loaded */}
          {!loading && hasData && (
            <>
              <Button size="sm" variant="secondary" onClick={handleExportCSV}>
                <Download size={13} />
                CSV
              </Button>
              <Button size="sm" variant="secondary" onClick={handleExportPDF}>
                <FileText size={13} />
                PDF
              </Button>
            </>
          )}

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
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ backgroundColor: "#f4f4f4" }}>
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
    { label: "Total",            value: data.stock.total            ?? 0, color: C.primary },
    { label: "Active",           value: data.stock.active           ?? 0, color: C.active },
    { label: "Expired",          value: data.stock.expired          ?? 0, color: C.expired },
    { label: "Police Notified",  value: data.stock.policeNotified   ?? 0, color: C.police },
    { label: "Inspections Done", value: data.inspections.completed  ?? 0, color: C.pass },
    { label: "Pass Rate",        value: `${data.inspections.passRate ?? 0}%`, color: C.pass },
    { label: "Pending Maint.",   value: data.maintenance.scheduled  ?? 0, color: C.scheduled },
    { label: "Maint. Done",      value: data.maintenance.completed  ?? 0, color: C.completed },
  ];

  const stockPie = [
    { name: "Active",          value: data.stock.active         ?? 0, fill: C.active },
    { name: "Expired",         value: data.stock.expired        ?? 0, fill: C.expired },
    { name: "Reported",        value: data.stock.reported       ?? 0, fill: C.reported },
    { name: "Police Notified", value: data.stock.policeNotified ?? 0, fill: C.police },
  ].filter((d) => d.value > 0);

  const inspPie = [
    { name: "Passed", value: data.inspections.passed ?? 0, fill: C.pass },
    { name: "Failed", value: data.inspections.failed ?? 0, fill: C.fail },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Stock by Status">
          {stockPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stockPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} fill="#8884d8"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Inspection Results">
          {inspPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={inspPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} fill="#8884d8"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                />
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
    { label: "Active",          value: data.active         ?? 0, fill: C.active },
    { label: "Expired",         value: data.expired        ?? 0, fill: C.expired },
    { label: "Reported",        value: data.reported       ?? 0, fill: C.reported },
    { label: "Police Notified", value: data.policeNotified ?? 0, fill: C.police },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KpiCard label="Total"          value={data.total         ?? 0} color={C.primary} />
        <KpiCard label="Active"         value={data.active        ?? 0} color={C.active} />
        <KpiCard label="Expired"        value={data.expired       ?? 0} color={C.expired} />
        <KpiCard label="Reported"       value={data.reported      ?? 0} color={C.reported} />
        <KpiCard label="Police Notified"value={data.policeNotified ?? 0} color={C.police} />
      </div>
      <ChartCard title="Stock Trend">
        {data.trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.trend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
              <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke={C.primary} strokeWidth={2} dot={false} name="Records" />
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
            <Bar dataKey="value" radius={[4, 4, 0, 0]}
              label={false}
              background={false as any}
            >
              {breakdown.map((b, i) => (
                <Bar key={i} dataKey="value" fill={b.fill} />
              ))}
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
    { label: "None",      value: data.none      ?? 0, fill: C.none },
    { label: "Pending",   value: data.pending   ?? 0, fill: C.pending },
    { label: "Completed", value: data.completed ?? 0, fill: C.completed },
  ];

  const results = [
    { name: "Passed", value: data.passed ?? 0, fill: C.pass },
    { name: "Failed", value: data.failed ?? 0, fill: C.fail },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total"     value={data.total     ?? 0} color={C.primary} />
        <KpiCard label="None"      value={data.none      ?? 0} color={C.none} />
        <KpiCard label="Pending"   value={data.pending   ?? 0} color={C.pending} />
        <KpiCard label="Completed" value={data.completed ?? 0} color={C.completed} />
        <KpiCard label="Passed"    value={data.passed    ?? 0} color={C.pass} />
        <KpiCard label="Pass Rate" value={`${data.passRate ?? 0}%`} color={C.pass} />
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
                <Line type="monotone" dataKey="count" stroke={C.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Pass / Fail">
          {results.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={results} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} fill="#8884d8"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                />
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
            <Bar dataKey="value" fill={C.primary} radius={[4, 4, 0, 0]} />
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
        <KpiCard label="Total Expired"   value={data.totalExpired   ?? 0} color={C.expired} />
        <KpiCard label="Police Notified" value={data.policeNotified ?? 0} color={C.police} />
      </div>
      <ChartCard title="Expiry Trend">
        {data.trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.trend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#999" }} />
              <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill={C.expired} radius={[4, 4, 0, 0]} name="Expired" />
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
                    <td className="pl-5 font-mono text-xs font-semibold" style={{ color: "#2f2f2f" }}>{r.extinguisherId}</td>
                    <td className="text-sm" style={{ color: "#666" }}>{r.ownerName}</td>
                    <td className="hidden sm:table-cell text-sm" style={{ color: "#666" }}>{r.ownerEmail}</td>
                    <td className="text-sm" style={{ color: "#d32f2f" }}>{new Date(r.expirationDate).toLocaleDateString()}</td>
                    <td>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: "#ffeaea", color: "#d32f2f" }}>
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
    { label: "None",      value: data.none      ?? 0, fill: C.none },
    { label: "Scheduled", value: data.scheduled ?? 0, fill: C.scheduled },
    { label: "Completed", value: data.completed ?? 0, fill: C.completed },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total"     value={data.total     ?? 0} color={C.primary} />
        <KpiCard label="None"      value={data.none      ?? 0} color={C.none} />
        <KpiCard label="Scheduled" value={data.scheduled ?? 0} color={C.scheduled} />
        <KpiCard label="Completed" value={data.completed ?? 0} color={C.completed} />
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
                <Line type="monotone" dataKey="count" stroke={C.scheduled} strokeWidth={2} dot={false} />
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
              <Bar dataKey="value" fill={C.scheduled} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      {data.records?.length > 0 && (
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "#d2d2d2" }}>
            <p className="text-sm font-semibold" style={{ color: "#2f2f2f" }}>Records ({data.records.length})</p>
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
                  const sc: Record<string, { bg: string; text: string }> = {
                    scheduled: { bg: "#eaf6ff", text: "#1976d2" },
                    completed: { bg: "#e8f5e9", text: "#2e7d32" },
                    none:      { bg: "#f3f4f6", text: "#666" },
                  };
                  const s = sc[r.maintenanceStatus] ?? sc.none;
                  return (
                    <tr key={r._id}>
                      <td className="pl-5 font-mono text-xs font-semibold" style={{ color: "#2f2f2f" }}>{r.extinguisherId}</td>
                      <td className="text-sm" style={{ color: "#666" }}>{r.ownerName}</td>
                      <td>
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-full capitalize" style={{ backgroundColor: s.bg, color: s.text }}>
                          {r.maintenanceStatus}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell text-sm" style={{ color: "#666" }}>
                        {r.scheduledMaintenanceDate ? new Date(r.scheduledMaintenanceDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="pr-5 hidden md:table-cell text-sm" style={{ color: "#666" }}>{r.maintenanceNotes || "—"}</td>
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

// ── Shared ────────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const display = value === undefined || value === null ? "—" : String(value);
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: color + "0d", borderColor: color + "33" }}>
      <p className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color }}>{label}</p>
      <p className="text-2xl font-bold mt-2 leading-none" style={{ color }}>{display}</p>
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
