"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { FireExtinguisher } from "@/types";
import { extinguisherService } from "@/services/extinguisherService";
import { useAuthContext } from "@/context/AuthContext";

export default function ExtinguisherDetailPage() {
  const params = useParams();
  const { admin } = useAuthContext();
  const role = admin?.role;

  const [data, setData] = useState<FireExtinguisher | null>(null);
  const [loading, setLoading] = useState(true);

  // Inspect form
  const [inspectResult, setInspectResult] = useState<"pass" | "fail">("pass");
  const [inspectNotes, setInspectNotes] = useState("");
  const [submittingInspect, setSubmittingInspect] = useState(false);

  // Maintenance form
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [submittingMaintenance, setSubmittingMaintenance] = useState(false);

  // Schedule inspection form (for users)
  const [scheduleInspectionDate, setScheduleInspectionDate] = useState("");
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  const load = async () => {
    try {
      const response = await extinguisherService.getOne(params.id as string);
      setData(response.data);
    } catch {
      toast.error("Failed to load extinguisher details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const handleMarkReported = async () => {
    if (!data) return;
    try {
      await extinguisherService.markReported(data._id);
      toast.success("Marked as reported successfully");
      load();
    } catch {
      toast.error("Failed to mark as reported");
    }
  };

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSubmittingInspect(true);
    try {
      await extinguisherService.inspect(data._id, inspectResult, inspectNotes);
      toast.success("Inspection logged successfully");
      setInspectNotes("");
      load();
    } catch {
      toast.error("Failed to log inspection");
    } finally {
      setSubmittingInspect(false);
    }
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !maintenanceDate) return;
    setSubmittingMaintenance(true);
    try {
      await extinguisherService.scheduleMaintenance(data._id, maintenanceDate, maintenanceNotes);
      toast.success("Maintenance scheduled successfully");
      setMaintenanceDate("");
      setMaintenanceNotes("");
      load();
    } catch {
      toast.error("Failed to schedule maintenance");
    } finally {
      setSubmittingMaintenance(false);
    }
  };

  const handleScheduleInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !scheduleInspectionDate) return;
    setSubmittingSchedule(true);
    try {
      await extinguisherService.scheduleInspection(data._id, scheduleInspectionDate);
      toast.success("Inspection scheduled successfully");
      setScheduleInspectionDate("");
      load();
    } catch {
      toast.error("Failed to schedule inspection");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40" style={{ color: "#666666" }}>
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-40" style={{ color: "#D32F2F" }}>
        Extinguisher not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
              {data.extinguisherId}
            </h1>
            <div className="mt-1">
              <Badge status={data.status} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(role === "admin" || role === "inspector") && (
              <Link href={`/dashboard/extinguishers/${data._id}/edit`}>
                <Button>Edit</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail label="Owner Name" value={data.ownerName} />
          <Detail label="Owner ID Number" value={data.ownerIdNumber} />
          <Detail label="Email" value={data.ownerEmail} />
          <Detail label="Phone" value={data.ownerPhone} />
          <Detail
            label="Issue Date"
            value={new Date(data.dateOfIssue).toLocaleDateString()}
          />
          <Detail
            label="Expiration Date"
            value={new Date(data.expirationDate).toLocaleDateString()}
          />
          <Detail
            label="Alert Sent At"
            value={data.alertSentAt ? new Date(data.alertSentAt).toLocaleString() : "Never"}
          />
          <Detail
            label="Police Notified At"
            value={data.policeNotifiedAt ? new Date(data.policeNotifiedAt).toLocaleString() : "Never"}
          />
          <Detail
            label="Inspection Status"
            value={data.inspectionStatus ?? "none"}
          />
          <Detail
            label="Scheduled Inspection"
            value={data.scheduledInspectionDate ? new Date(data.scheduledInspectionDate).toLocaleDateString() : "Not scheduled"}
          />
          <Detail
            label="Maintenance Status"
            value={data.maintenanceStatus ?? "none"}
          />
          <Detail
            label="Scheduled Maintenance"
            value={data.scheduledMaintenanceDate ? new Date(data.scheduledMaintenanceDate).toLocaleDateString() : "Not scheduled"}
          />
        </div>

        {data.notes && <Detail label="Notes" value={data.notes} />}
        {data.maintenanceNotes && <Detail label="Maintenance Notes" value={data.maintenanceNotes} />}

        {/* Admin: Mark as Reported */}
        {role === "admin" && data.status === "active" && (
          <div className="pt-4 border-t" style={{ borderColor: "#D2D2D2" }}>
            <Button onClick={handleMarkReported} variant="danger" className="w-full">
              Mark as Reported
            </Button>
          </div>
        )}
      </div>

      {/* Inspector: Log Inspection */}
      {role === "inspector" && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
            Log Inspection Result
          </h2>
          <form onSubmit={handleInspect} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "#2F2F2F" }}>
                Result
              </label>
              <select
                value={inspectResult}
                onChange={(e) => setInspectResult(e.target.value as "pass" | "fail")}
                className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#D2D2D2",
                  color: "#2F2F2F",
                }}
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>
            <Input
              label="Notes (optional)"
              placeholder="Inspection notes..."
              value={inspectNotes}
              onChange={(e) => setInspectNotes(e.target.value)}
            />
            <Button type="submit" loading={submittingInspect}>
              Submit Inspection
            </Button>
          </form>
        </div>
      )}

      {/* Inspector: Schedule Maintenance */}
      {role === "inspector" && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
            Schedule Maintenance
          </h2>
          <form onSubmit={handleScheduleMaintenance} className="space-y-4">
            <Input
              label="Maintenance Date"
              type="date"
              value={maintenanceDate}
              onChange={(e) => setMaintenanceDate(e.target.value)}
            />
            <Input
              label="Maintenance Notes (optional)"
              placeholder="What needs to be done..."
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
            />
            <Button type="submit" loading={submittingMaintenance}>
              Schedule Maintenance
            </Button>
          </form>
        </div>
      )}

      {/* User: Schedule Inspection */}
      {role === "user" && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
            Request Inspection
          </h2>
          <p className="text-sm" style={{ color: "#666666" }}>
            Choose a preferred date to schedule an inspection for this extinguisher.
          </p>
          <form onSubmit={handleScheduleInspection} className="space-y-4">
            <Input
              label="Preferred Inspection Date"
              type="date"
              value={scheduleInspectionDate}
              onChange={(e) => setScheduleInspectionDate(e.target.value)}
            />
            <Button type="submit" loading={submittingSchedule}>
              Schedule Inspection
            </Button>
          </form>
        </div>
      )}

      {/* Inspection Logs */}
      {data.inspectionLogs && data.inspectionLogs.length > 0 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
            Inspection History
          </h2>
          <div className="space-y-3">
            {data.inspectionLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg border"
                style={{ borderColor: "#D2D2D2" }}
              >
                <span
                  className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: log.result === "pass" ? "#4CAF50" : "#F44336",
                    marginTop: "5px",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#2F2F2F" }}>
                    {log.result.toUpperCase()} &mdash;{" "}
                    {new Date(log.inspectedAt).toLocaleDateString()}
                  </p>
                  {log.notes && (
                    <p className="text-xs mt-1" style={{ color: "#666666" }}>
                      {log.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm" style={{ color: "#666666" }}>{label}</p>
      <p className="font-medium" style={{ color: "#2F2F2F" }}>{value}</p>
    </div>
  );
}
