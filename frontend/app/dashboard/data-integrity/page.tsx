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
    if (admin && admin.role !== "admin") {
      router.push("/dashboard");
    }
  }, [admin, router]);

  const handleCheck = async () => {
    setLoadingCheck(true);
    setCleanupResult(null);
    try {
      const response = await userService.checkDataIntegrity();
      setResult(response.data || response);
      if (response.integrityPassed || response.data?.integrityPassed) {
        toast.success("Database integrity check passed perfectly!");
      } else {
        toast.error(`Found ${response.totalIssues || response.data?.totalIssues} integrity issues.`);
      }
    } catch {
      toast.error("Failed to run data integrity check");
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleClean = async () => {
    if (!confirm("Are you sure you want to run database cleanup? This will automatically mark all past-expiration active extinguishers as 'expired'.")) return;
    setLoadingClean(true);
    setResult(null);
    try {
      const response = await userService.cleanData();
      setCleanupResult(response.details || response.data?.details || response);
      toast.success("Data cleanup completed successfully!");
    } catch {
      toast.error("Failed to execute data cleanup");
    } finally {
      setLoadingClean(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          Data Integrity Diagnostics & Cleanup
        </h1>
        <p className="text-sm" style={{ color: "#666666" }}>
          Diagnose database inconsistencies, missing values, outdated status records, and automatically run standard compliance corrections.
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleCheck} loading={loadingCheck}>
          {loadingCheck ? "Checking..." : "Run Integrity Diagnostic"}
        </Button>

        <Button onClick={handleClean} loading={loadingClean} variant="secondary" style={{ borderColor: "#D32F2F", color: "#D32F2F" }}>
          {loadingClean ? "Running Cleanup..." : "Run Database Compliance Cleanup"}
        </Button>
      </div>

      {result && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: result.integrityPassed ? "#4CAF50" : "#F44336",
              }}
            />
            <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
              Diagnostic Result: {result.integrityPassed ? "PASS" : "FAIL"}
            </h2>
          </div>

          <p style={{ color: "#666666" }}>
            Total Inconsistencies Detected: <strong>{result.totalIssues}</strong>
          </p>

          {result.issues && result.issues.length > 0 ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <ul className="list-disc pl-5 space-y-2 text-sm text-red-800">
                {result.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-green-700 font-semibold bg-green-50 p-4 rounded-lg border border-green-200">
              No structural errors or invalid status alignments detected in the database.
            </p>
          )}
        </div>
      )}

      {cleanupResult && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold" style={{ color: "#2F2F2F" }}>
            Compliance Cleanup Summary
          </h2>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800">
            <p>✔ Auto-expired active extinguishers: <strong>{cleanupResult.autoExpiredCount || 0}</strong></p>
            <p className="mt-2 text-xs text-green-700">Database synchronization is completely up-to-date.</p>
          </div>
        </div>
      )}
    </div>
  );
}
