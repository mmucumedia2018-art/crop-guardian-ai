import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ScanRecord {
  id: string;
  created_at: string;
  crop: string | null;
  is_healthy: boolean;
  disease_name: string | null;
  confidence: string | null;
  severity: string | null;
  description: string | null;
  treatment: string[] | null;
  prevention: string[] | null;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("scan_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setRecords((data as ScanRecord[]) || []);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-1">Scan History</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your recent crop scans and diagnoses
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No scans yet. Try scanning a leaf!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <motion.button
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="w-full diagnostic-card flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              onClick={() => {
                navigate("/results", {
                  state: {
                    disease: {
                      name: record.disease_name || "Healthy",
                      crop: record.crop || "Unknown",
                      confidence: record.confidence || "Moderate",
                      severity: record.severity || "None",
                      description: record.description || "",
                      treatment: record.treatment || [],
                      prevention: record.prevention || [],
                    },
                    imageUrl: "",
                    isHealthy: record.is_healthy,
                  },
                });
              }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  record.is_healthy ? "bg-primary/10" : "bg-destructive/10"
                }`}
              >
                {record.is_healthy ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {record.is_healthy ? "Healthy" : record.disease_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {record.crop || "Unknown"} ·{" "}
                  {new Date(record.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
