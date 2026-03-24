import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Shield, Leaf, TrendingUp, CloudRain, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherAlert {
  crop: string;
  disease: string;
  risk_level: "High" | "Moderate" | "Low";
  description: string;
}

const CROP_GROUPS = [
  { key: "crops.cereals", crops: ["Maize", "Wheat", "Rice", "Sorghum", "Millet", "Barley"] },
  { key: "crops.legumes", crops: ["Beans", "Soybeans", "Groundnuts", "Chickpeas", "Lentils", "Cowpeas"] },
  { key: "crops.tubers", crops: ["Potato", "Cassava", "Sweet Potato", "Yam"] },
  { key: "crops.vegetables", crops: ["Tomato", "Pepper", "Onion", "Cabbage", "Kale", "Spinach", "Carrot", "Cucumber", "Eggplant", "Okra"] },
  { key: "crops.fruits", crops: ["Banana", "Mango", "Avocado", "Citrus", "Papaya", "Grape", "Apple", "Watermelon", "Guava"] },
  { key: "crops.oilCrops", crops: ["Sunflower", "Sesame", "Oil Palm", "Coconut"] },
  { key: "crops.stimulants", crops: ["Coffee", "Tea", "Cocoa"] },
  { key: "crops.fibre", crops: ["Cotton", "Sisal"] },
  { key: "crops.sugar", crops: ["Sugarcane", "Sugar Beet"] },
  { key: "crops.spices", crops: ["Ginger", "Turmeric", "Garlic", "Chili"] },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [recentOutbreaks, setRecentOutbreaks] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        const { data, error } = await supabase.functions.invoke("weather-alerts", {
          body: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        });
        if (!error && data?.alerts) setWeatherAlerts(data.alerts);
      } catch {
        // Silently fail
      } finally {
        setLoadingAlerts(false);
      }
    };

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
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("app.name")}</h1>
          <p className="text-xs text-muted-foreground">{t("app.tagline")}</p>
        </div>
      </div>

      {/* Weather Risk Alerts */}
      {loadingAlerts ? (
        <div className="diagnostic-card mb-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("home.checkingRisk")}</p>
        </div>
      ) : weatherAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-warning" /> {t("home.diseaseRiskAlerts")}
          </h3>
          <div className="space-y-2">
            {weatherAlerts.slice(0, 3).map((alert, i) => (
              <div key={i} className="diagnostic-card flex items-start gap-3">
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${riskColor(alert.risk_level)}`}>
                  {alert.risk_level}
                </div>
                <div>
                  <p className="text-sm font-semibold">{alert.disease} {t("home.riskOn")} {alert.crop}</p>
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
            <h2 className="text-lg font-bold text-primary-foreground">{t("home.scanTitle")}</h2>
            <p className="text-sm text-primary-foreground/80 mt-0.5">{t("home.scanDesc")}</p>
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
                {recentOutbreaks} {t("home.diseasesReported")}
              </p>
              <p className="text-xs text-muted-foreground">{t("home.tapToView")}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: t("home.crops"), value: "50+", icon: Leaf },
          { label: t("home.diseases"), value: "120+", icon: Shield },
          { label: t("home.accuracy"), value: "95%", icon: TrendingUp },
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
      <h3 className="font-bold text-base mb-4">{t("home.howItWorks")}</h3>
      <div className="space-y-3">
        {[
          { step: 1, title: t("home.step1Title"), desc: t("home.step1Desc") },
          { step: 2, title: t("home.step2Title"), desc: t("home.step2Desc") },
          { step: 3, title: t("home.step3Title"), desc: t("home.step3Desc") },
          { step: 4, title: t("home.step4Title"), desc: t("home.step4Desc") },
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
      <h3 className="font-bold text-base mt-8 mb-4">{t("home.supportedCrops")}</h3>
      <div className="space-y-4 mb-4">
        {CROP_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-xs font-semibold text-muted-foreground mb-2">{t(group.key)}</p>
            <div className="flex gap-2 flex-wrap">
              {group.crops.map((crop) => (
                <span key={crop} className="px-3 py-1.5 rounded-full bg-card text-sm font-medium border">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
