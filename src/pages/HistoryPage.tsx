import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { MOCK_HISTORY } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-1">Scan History</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your recent crop scans and diagnoses
      </p>

      <div className="space-y-3">
        {MOCK_HISTORY.map((record, i) => (
          <motion.button
            key={record.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className="w-full diagnostic-card flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            onClick={() => {
              if (record.disease) {
                navigate("/results", { state: { disease: record.disease, imageUrl: "" } });
              }
            }}
          >
            {/* Status icon */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                record.isHealthy ? "bg-primary/10" : "bg-destructive/10"
              }`}
            >
              {record.isHealthy ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {record.isHealthy ? "Healthy" : record.disease?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {record.crop} · {new Date(record.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {MOCK_HISTORY.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No scans yet</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
