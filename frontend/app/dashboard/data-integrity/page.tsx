"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { userService } from "@/services/userService";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface IntegrityResult {
  integrityPassed: boolean;
  totalIssues: number;
  issues: string[];
}

interface CleanupResult {
  autoExpiredCount: number;
}

export default function DataIntegrityPage() {
  const { admin } = useAuthContext();
  const router = useRouter();
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingClean, setLoadingClean] = useState(false);
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);

  useEffect(() => {
    if (admin && admin.role !== "admin") router.push("/dashboard");
  }, [admin, router]);

  const handleCheck = async () => {
    setLoadingCheck(true);
    setCleanupResult(null);
    try {
      const response = await userService.checkDataIntegrity();
      const data: IntegrityResult = response.data || response;
      setResult(data);
      if (data.integrityPassed) {
        toast.success("Integrity check passed!");
      } else {
        toast.error(`Found ${data.totalIssues} issue${data.totalIssues !== 1 ? "s" : ""}`);
      }
    } catch {
      toast.error("Failed to run integrity check");
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleClean = async () => {
    if (!confirm("This will auto-expire all past-expiration active extinguishers. Continue?")) return;
    setLoadingClean(true);
    setResult(null);
    try {
      const response = await userService.cleanData();
      const data: CleanupResult = response.details || response.data?.details || response;
      setCleanupResult(data);
      toast.success("Cleanup completed");
    } catch {
      toast.error("Cleanup failed");
    } finally {
      setLoadingClean(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#2f2f2f" }}>Data Integrity</h1>
        <p className="text-sm mt-0.5" style={{ color: "#999" }}>
          Diagnose database inconsistencies and run automated compliance corrections.
        </p>
      </div>

      {/* Actions */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: "#2f2f2f" }}>Diagnostics</h2>
        <p className="text-sm" style={{ color: "#666" }}>
          Checks for missing values, invalid status alignments, and outdated records.
        </p>
        <Button loading={loadingCheck} onClick={handleCheck} size="sm">
          Run Integrity Check
        </Button>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: "#2f2f2f" }}>Compliance Cleanup</h2>
        <p className="text-sm" style={{ color: "#666" }}>
          Automatically marks all past-expiration active extinguishers as expired.
        </p>
        <Button loading={loadingClean} onClick={handleClean} size="sm" variant="secondary"
          style={{ borderColor: "#ffd0d0", color: "#d32f2f" }}>
          Run Cleanup
        </Button>
      </div>

      {/* Integrity result */}
      {result && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{
                backgroundColor: result.integrityPassed ? "#e8f5e9" : "#ffeaea",
              }}
            >
              {result.integrityPassed ? "✅" : "❌"}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#2f2f2f" }}>
                Integrity Check — {result.integrityPassed ? "PASSED" : "FAILED"}
              </p>
              <p className="text-xs" style={{ color: "#999" }}>
                {result.totalIssues} issue{result.totalIssues !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>

          {result.issues && result.issues.length > 0 ? (
            <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: "#ffd0d0", backgroundColor: "#fff8f8" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#d32f2f" }}>
                Issues
              </p>
              <ul className="space-y-1.5">
                {result.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#444" }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#d32f2f" }}>•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border p-4" style={{ borderColor: "#c8e6c9", backgroundColor: "#f1f8e9" }}>
              <p className="text-sm" style={{ color: "#2e7d32" }}>
                No structural errors or invalid status alignments detected.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cleanup result */}
      {cleanupResult && (
        <div className="card space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: "#e8f5e9" }}>
              🧹
            </div>
            <p className="font-semibold text-sm" style={{ color: "#2f2f2f" }}>Cleanup Complete</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: "#c8e6c9", backgroundColor: "#f1f8e9" }}>
            <p className="text-sm" style={{ color: "#2e7d32" }}>
              Auto-expired <strong>{cleanupResult.autoExpiredCount ?? 0}</strong> record{(cleanupResult.autoExpiredCount ?? 0) !== 1 ? "s" : ""}.
              Database is now up-to-date.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
