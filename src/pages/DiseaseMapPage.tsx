import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, AlertTriangle, CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/contexts/LanguageContext";

interface MapScan {
  id: string;
  crop: string | null;
  disease_name: string | null;
  is_healthy: boolean;
  severity: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

const DiseaseMapPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scans, setScans] = useState<MapScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  useEffect(() => {
    const fetchMapData = async () => {
      const weekAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("scan_history")
        .select("id, crop, disease_name, is_healthy, severity, latitude, longitude, created_at")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false })
        .limit(100);

      const typedData = (data as unknown as MapScan[]) || [];
      setScans(typedData);

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      } catch {
        if (typedData.length > 0) {
          setCenter([typedData[0].latitude, typedData[0].longitude]);
        }
      }
      setLoading(false);
    };
    fetchMapData();
  }, []);

  const severityRadius = (severity: string | null) =>
    severity === "Severe" ? 12 : severity === "Moderate" ? 9 : 6;

  const diseaseCount = scans.filter((s) => !s.is_healthy).length;
  const healthyCount = scans.filter((s) => s.is_healthy).length;

  return (
    <div className="px-4 pt-4 pb-4">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ChevronLeft className="w-4 h-4" /> {t("map.home")}
      </button>

      <h1 className="text-xl font-bold mb-1">{t("map.title")}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t("map.subtitle")}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="diagnostic-card flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <div>
            <p className="text-lg font-bold">{diseaseCount}</p>
            <p className="text-xs text-muted-foreground">{t("map.diseasesReported")}</p>
          </div>
        </div>
        <div className="diagnostic-card flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <div>
            <p className="text-lg font-bold">{healthyCount}</p>
            <p className="text-xs text-muted-foreground">{t("map.healthyScans")}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl overflow-hidden border"
          style={{ height: "300px" }}
        >
          <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {scans.map((scan) => (
              <CircleMarker
                key={scan.id}
                center={[scan.latitude, scan.longitude]}
                radius={severityRadius(scan.severity)}
                pathOptions={{
                  color: scan.is_healthy ? "hsl(142, 72%, 37%)" : "hsl(0, 84%, 50%)",
                  fillColor: scan.is_healthy ? "hsl(142, 72%, 37%)" : "hsl(0, 84%, 50%)",
                  fillOpacity: 0.6,
                }}
              >
                <Popup>
                  <strong>{scan.is_healthy ? t("results.healthy") : scan.disease_name}</strong>
                  <br />
                  {scan.crop} · {scan.severity || "N/A"}
                  <br />
                  {new Date(scan.created_at).toLocaleDateString()}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </motion.div>
      )}

      {scans.filter((s) => !s.is_healthy).length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-sm mb-3">{t("map.recentReports")}</h3>
          <div className="space-y-2">
            {scans
              .filter((s) => !s.is_healthy)
              .slice(0, 5)
              .map((scan) => (
                <div key={scan.id} className="diagnostic-card flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{scan.disease_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.crop} · {scan.severity} · {new Date(scan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseMapPage;
