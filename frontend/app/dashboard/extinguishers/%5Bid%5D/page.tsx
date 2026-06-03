"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { FireExtinguisher } from "@/types";
import { extinguisherService } from "@/services/extinguisherService";
import { useAuthContext } from "@/context/AuthContext";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { admin } = useAuthContext();
  const [data, setData] = useState<FireExtinguisher>();
  const [loading, setLoading] = useState(true);

  // Inspector Action States
  const [inspectResult, setInspectResult] = useState<"pass" | "fail">("pass");
  const [inspectNotes, setInspectNotes] = useState("");
  const [loadingInspect, setLoadingInspect] = useState(false);

  const [maintDate, setMaintDate] = useState("");
  const [maintNotes, setMaintNotes] = useState("");
  const [loadingMaint, setLoadingMaint] = useState(false);

  // User Action States
  const [inspectSchedDate, setInspectSchedDate] = useState("");
  const [loadingSched, setLoadingSched] = useState(false);

  const loadData = async () => {
    try {
      const response = await extinguisherService.getOne(params.id as string);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch extinguisher:", error);
      toast.error("Failed to load extinguisher details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleMarkReported = async () => {
    try {
      if (!data) return;
      await extinguisherService.markReported(data._id);
      toast.success("Marked as reported successfully");
      loadData();
    } catch (error) {
      console.error("Failed to mark as reported:", error);
      toast.error("Failed to mark as reported");
    }
  };

  const handleLogInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setLoadingInspect(true);
    try {
      await extinguisherService.inspect(data._id, inspectResult, inspectNotes);
      toast.success("Inspection logged successfully!");
      setInspectNotes("");
      loadData();
    } catch {
      toast.error("Failed to log inspection");
    } finally {
      setLoadingInspect(false);
    }
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !maintDate) {
      toast.error("Maintenance date is required");
      return;
    }
    setLoadingMaint(true);
    try {
      await extinguisherService.scheduleMaintenance(data._id, maintDate, maintNotes);
      toast.success("Maintenance scheduled successfully!");
      setMaintDate("");
      setMaintNotes("");
      loadData();
    } catch {
      toast.error("Failed to schedule maintenance");
    } finally {
      setLoadingMaint(false);
    }
  };

  const handleScheduleInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !inspectSchedDate) {
      toast.error("Inspection date is required");
      return;
    }
    setLoadingSched(true);
    try {
      await extinguisherService.scheduleInspection(data._id, inspectSchedDate);
      toast.success("Inspection scheduled successfully!");
      setInspectSchedDate("");
      loadData();
    } catch {
      toast.error("Failed to schedule inspection");
    } finally {
      setLoadingSched(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    if (!confirm("Are you sure you want to delete this extinguisher?")) return;
    try {
      await extinguisherService.delete(data._id);
      toast.success("Extinguisher deleted");
      router.push("/dashboard/extinguishers");
    } catch {
      toast.error("Failed to delete extinguisher");
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-100"
        style={{ color: "#666666" }}
      >
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="flex items-center justify-center min-h-100"
        style={{ color: "#D32F2F" }}
      >
        Extinguisher not found
      </div>
    );
  }

  const isAdmin = admin?.role === "admin";
  const isInspector = admin?.role === "inspector";
  const isUser = admin?.role === "user";

  return (
    <div className="space-y-6">
      {/* Extinguisher Info Card */}
      <div className="card space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
              {data.extinguisherId}
            </h1>
            <Badge status={data.status} />
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Link href={`/dashboard/extinguishers/${data._id}/edit`}>
                  <Button>Edit Details</Button>
                </Link>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Owner Name</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>{data.ownerName}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Owner ID Number</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>{data.ownerIdNumber}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Email</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>{data.ownerEmail}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Phone</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>{data.ownerPhone}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Issue Date</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>
              {new Date(data.dateOfIssue).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Expiration Date</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>
              {new Date(data.expirationDate).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Alert Sent At</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>
              {data.alertSentAt ? new Date(data.alertSentAt).toLocaleString() : "Never"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm" style={{ color: "#666666" }}>Police Notified At</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>
              {data.policeNotifiedAt ? new Date(data.policeNotifiedAt).toLocaleString() : "Never"}
            </p>
          </div>
        </div>

        {data.notes && (
          <div className="space-y-1 pt-2 border-t" style={{ borderColor: "#D2D2D2" }}>
            <p className="text-sm" style={{ color: "#666666" }}>Notes</p>
            <p className="font-medium" style={{ color: "#2F2F2F" }}>{data.notes}</p>
          </div>
        )}

        {(isAdmin || isInspector) && data.status === "active" && (
          <div className="pt-4 border-t" style={{ borderColor: "#D2D2D2" }}>
            <Button onClick={handleMarkReported} className="w-full" variant="danger">
              Mark as Reported
            </Button>
          </div>
        )}
      </div>

      {/* Compliance / Schedule Information */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
          Inspection & Maintenance compliance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold" style={{ color: "#666666" }}>INSPECTION SCHEDULE</p>
            <p className="text-sm mt-1" style={{ color: "#2F2F2F" }}>
              Status: <strong className="capitalize">{data.inspectionStatus || "none"}</strong>
            </p>
            <p className="text-sm mt-1" style={{ color: "#2F2F2F" }}>
              Scheduled Date: <strong>{data.scheduledInspectionDate ? new Date(data.scheduledInspectionDate).toLocaleDateString() : "None"}</strong>
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold" style={{ color: "#666666" }}>MAINTENANCE SCHEDULE</p>
            <p className="text-sm mt-1" style={{ color: "#2F2F2F" }}>
              Status: <strong className="capitalize">{data.maintenanceStatus || "none"}</strong>
            </p>
            <p className="text-sm mt-1" style={{ color: "#2F2F2F" }}>
              Scheduled Date: <strong>{data.scheduledMaintenanceDate ? new Date(data.scheduledMaintenanceDate).toLocaleDateString() : "None"}</strong>
            </p>
            {data.maintenanceNotes && (
              <p className="text-xs mt-2 italic" style={{ color: "#666666" }}>
                Notes: {data.maintenanceNotes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conditional Inspector Action Forms */}
      {(isAdmin || isInspector) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inspection Log Form */}
          <div className="card space-y-4">
            <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
              Log Inspection Result
            </h2>
            <form onSubmit={handleLogInspection} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#2F2F2F" }}>
                  Inspection Outcome
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="result"
                      value="pass"
                      checked={inspectResult === "pass"}
                      onChange={() => setInspectResult("pass")}
                    />
                    <span style={{ color: "#2F2F2F" }}>Pass (Mark Active)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="result"
                      value="fail"
                      checked={inspectResult === "fail"}
                      onChange={() => setInspectResult("fail")}
                    />
                    <span style={{ color: "#2F2F2F" }}>Fail (Mark Reported)</span>
                  </label>
                </div>
              </div>

              <Textarea
                label="Diagnostic Notes"
                placeholder="Describe current condition, pressure levels, seal integrity, etc..."
                value={inspectNotes}
                onChange={(e) => setInspectNotes(e.target.value)}
              />

              <Button type="submit" loading={loadingInspect} className="w-full">
                Submit Inspection Report
              </Button>
            </form>
          </div>

          {/* Schedule Maintenance Form */}
          <div className="card space-y-4">
            <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
              Schedule Maintenance
            </h2>
            <form onSubmit={handleScheduleMaintenance} className="space-y-4">
              <Input
                label="Scheduled Maintenance Date"
                type="date"
                value={maintDate}
                onChange={(e) => setMaintDate(e.target.value)}
              />

              <Textarea
                label="Maintenance Details / Instructions"
                placeholder="Replacement of nozzle, hydrotesting, recharging chemical..."
                value={maintNotes}
                onChange={(e) => setMaintNotes(e.target.value)}
              />

              <Button type="submit" loading={loadingMaint} className="w-full">
                Schedule Maintenance Work
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Conditional User Action Form */}
      {(isAdmin || isUser) && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
            Schedule compliance Inspection
          </h2>
          <p className="text-sm" style={{ color: "#666666" }}>
            Request an inspector to visit your site and run safety compliance tests on your fire extinguisher.
          </p>
          <form onSubmit={handleScheduleInspection} className="flex flex-col sm:flex-row gap-4 items-end max-w-xl">
            <div className="flex-1 w-full">
              <Input
                label="Requested Inspection Date"
                type="date"
                value={inspectSchedDate}
                onChange={(e) => setInspectSchedDate(e.target.value)}
              />
            </div>
            <Button type="submit" loading={loadingSched} className="w-full sm:w-auto h-[46px]">
              Request Inspection
            </Button>
          </form>
        </div>
      )}

      {/* Inspection Log History */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
          Inspection History Logs
        </h2>

        {data.inspectionLogs && data.inspectionLogs.length > 0 ? (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {data.inspectionLogs.map((log, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:justify-between gap-2 bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: log.result === "pass" ? "#4CAF50" : "#F44336",
                      }}
                    />
                    <strong className="text-sm capitalize" style={{ color: "#2F2F2F" }}>
                      Result: {log.result}
                    </strong>
                  </div>
                  {log.notes && (
                    <p className="text-sm mt-1" style={{ color: "#666666" }}>
                      Notes: {log.notes}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: "#999999" }}>
                    Inspector Reference ID: {log.inspectorId}
                  </p>
                </div>
                <div className="text-right text-xs" style={{ color: "#666666" }}>
                  {new Date(log.inspectedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-6" style={{ color: "#666666" }}>
            No inspection logs found for this extinguisher.
          </p>
        )}
      </div>
    </div>
  );
}
