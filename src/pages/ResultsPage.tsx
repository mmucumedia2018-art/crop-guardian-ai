import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ChevronLeft, Bug, ShieldCheck, Leaf, DollarSign } from "lucide-react";

interface TreatmentCost {
  item: string;
  cost_usd: number;
  notes: string;
}

interface DiagnosisResult {
  id?: string;
  name: string;
  crop: string;
  confidence: string;
  severity: string;
  description: string;
  treatment: string[];
  treatment_costs?: TreatmentCost[];
  prevention: string[];
}

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const disease = location.state?.disease as DiagnosisResult | undefined;
  const imageUrl = location.state?.imageUrl as string | undefined;
  const isHealthy = location.state?.isHealthy as boolean | undefined;

  if (!disease) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-muted-foreground">No scan results. Please scan a leaf first.</p>
        <button onClick={() => navigate("/scan")} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          Go to Scan
        </button>
      </div>
    );
  }

  const severityColor =
    disease.severity === "Severe" ? "text-destructive" :
    disease.severity === "Moderate" ? "text-warning" : "text-primary";

  const confidenceBg =
    disease.confidence === "High" ? "bg-primary/10 text-primary" :
    disease.confidence === "Moderate" ? "bg-warning/10 text-warning" :
    "bg-muted text-muted-foreground";

  const KSH_RATE = 129;
  const totalCost = disease.treatment_costs?.reduce((sum, c) => sum + c.cost_usd, 0) ?? 0;

  return (
    <div className="px-4 pt-4 pb-4">
      <button onClick={() => navigate("/scan")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ChevronLeft className="w-4 h-4" /> New Scan
      </button>

      {imageUrl && (
        <div className="relative rounded-xl overflow-hidden mb-4 border">
          <img src={imageUrl} alt="Scanned leaf" className="w-full aspect-[4/3] object-cover" />
          <div className="absolute bottom-3 left-3">
            {isHealthy ? (
              <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Healthy
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5" /> Disease Detected
              </span>
            )}
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-xl font-bold">{isHealthy ? "Healthy Plant" : disease.name}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${confidenceBg}`}>
            {disease.confidence} Confidence
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Crop: {disease.crop}</p>
        {!isHealthy && (
          <p className={`text-sm font-semibold ${severityColor} flex items-center gap-1 mb-4`}>
            <AlertTriangle className="w-4 h-4" /> {disease.severity} Severity
          </p>
        )}
        <p className="text-sm leading-relaxed mb-6">{disease.description}</p>
      </motion.div>

      {/* Treatment Steps */}
      {disease.treatment && disease.treatment.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {isHealthy ? "Care Tips" : "Recommended Treatment"}
          </h2>
          <div className="space-y-3 mb-6">
            {disease.treatment.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Treatment Cost Estimator */}
      {disease.treatment_costs && disease.treatment_costs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-warning" />
            Estimated Treatment Cost
          </h2>
          <div className="diagnostic-card space-y-3 mb-6">
            {disease.treatment_costs.map((cost, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{cost.item}</p>
                  <p className="text-xs text-muted-foreground">{cost.notes}</p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-sm font-bold text-warning">KSh {(cost.cost_usd * KSH_RATE).toFixed(0)}</span>
                  <span className="text-xs text-muted-foreground ml-1">(${cost.cost_usd.toFixed(2)})</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 flex items-center justify-between">
              <p className="text-sm font-bold">Total Estimated Cost</p>
              <p className="text-base font-bold text-warning">KSh {(totalCost * KSH_RATE).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">(${totalCost.toFixed(2)})</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prevention */}
      {disease.prevention && disease.prevention.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.2 }}>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> Prevention
          </h2>
          <div className="space-y-2 mb-4">
            {disease.prevention.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={() => navigate("/scan")} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform">
          Scan Another
        </button>
        <button onClick={() => navigate("/history")} className="flex-1 py-3 rounded-xl bg-card border font-semibold text-sm active:scale-[0.98] transition-transform">
          View History
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
