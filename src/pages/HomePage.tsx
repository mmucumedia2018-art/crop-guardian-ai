import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Shield, Leaf, TrendingUp, CloudRain, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeatherAlert {
  crop: string;
  disease: string;
  risk_level: "High" | "Moderate" | "Low";
  description: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [recentOutbreaks, setRecentOutbreaks] = useState(0);

  useEffect(() => {
    // Fetch weather-based risk alerts
    const fetchAlerts = async () => {
      try {
        // Get user location
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );

        const { data, error } = await supabase.functions.invoke("weather-alerts", {
          body: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        });

        if (!error && data?.alerts) {
          setWeatherAlerts(data.alerts);
        }
      } catch {
        // Silently fail — alerts are optional
      } finally {
        setLoadingAlerts(false);
      }
    };

    // Count recent disease outbreaks
    const fetchOutbreaks = async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("scan_history")
        .select("*", { count: "exact", head: true })
        .eq("is_healthy", false)
        .gte("created_at", weekAgo);
      setRecentOutbreaks(count || 0);
    };

    fetchAlerts();
    fetchOutbreaks();
  }, []);

  const riskColor = (level: string) =>
    level === "High" ? "text-destructive bg-destructive/10" :
    level === "Moderate" ? "text-warning bg-warning/10" :
    "text-primary bg-primary/10";

  return (
    <div className="px-4 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">CropGuard AI</h1>
          <p className="text-xs text-muted-foreground">Intelligent Crop Health System</p>
        </div>
      </div>

      {/* Weather Risk Alerts */}
      {loadingAlerts ? (
        <div className="diagnostic-card mb-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking disease risk conditions…</p>
        </div>
      ) : weatherAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-warning" /> Disease Risk Alerts
          </h3>
          <div className="space-y-2">
            {weatherAlerts.slice(0, 3).map((alert, i) => (
              <div key={i} className="diagnostic-card flex items-start gap-3">
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${riskColor(alert.risk_level)}`}>
                  {alert.risk_level}
                </div>
                <div>
                  <p className="text-sm font-semibold">{alert.disease} risk on {alert.crop}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="diagnostic-card bg-primary mb-6 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => navigate("/scan")}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <Camera className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-foreground">Scan Your Crop</h2>
            <p className="text-sm text-primary-foreground/80 mt-0.5">
              Detect diseases, get treatment costs & prevention tips
            </p>
          </div>
        </div>
      </motion.div>

      {/* Community Outbreak Banner */}
      {recentOutbreaks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="diagnostic-card border-warning/30 bg-warning/5 mb-6 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/map")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                {recentOutbreaks} disease{recentOutbreaks > 1 ? "s" : ""} reported nearby this week
              </p>
              <p className="text-xs text-muted-foreground">Tap to view community disease map</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Crops", value: "50+", icon: Leaf },
          { label: "Diseases", value: "120+", icon: Shield },
          { label: "Accuracy", value: "95%", icon: TrendingUp },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="diagnostic-card text-center"
          >
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <h3 className="font-bold text-base mb-4">How It Works</h3>
      <div className="space-y-3">
        {[
          { step: 1, title: "Capture", desc: "Take a clear photo of the affected leaf" },
          { step: 2, title: "Analyse", desc: "AI analyses image + local weather conditions" },
          { step: 3, title: "Diagnose", desc: "Get diagnosis, treatment costs & prevention tips" },
          { step: 4, title: "Alert", desc: "Community gets warned of nearby outbreaks" },
        ].map((item) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: item.step * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-foreground">{item.step}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Supported Crops */}
      <h3 className="font-bold text-base mt-8 mb-4">Supported Crops</h3>
      <div className="flex gap-2 flex-wrap mb-4">
        {["Tomato", "Maize", "Rice", "Potato", "Cassava", "Wheat", "Bean", "Pepper"].map(
          (crop) => (
            <span
              key={crop}
              className="px-3 py-1.5 rounded-full bg-card text-sm font-medium border"
            >
              {crop}
            </span>
          )
        )}
      </div>
    </div>
  );
};

export default HomePage;
