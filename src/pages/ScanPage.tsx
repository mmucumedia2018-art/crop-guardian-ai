import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, ChevronDown, Search, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CROP_OPTIONS = [
  "Auto-detect",
  "Maize", "Wheat", "Rice", "Sorghum", "Millet", "Barley",
  "Beans", "Soybeans", "Groundnuts", "Chickpeas", "Lentils", "Cowpeas",
  "Potato", "Cassava", "Sweet Potato", "Yam",
  "Tomato", "Pepper", "Onion", "Cabbage", "Kale", "Spinach", "Carrot", "Cucumber", "Eggplant", "Okra",
  "Banana", "Mango", "Avocado", "Citrus", "Papaya", "Pineapple", "Grape", "Apple", "Watermelon", "Guava",
  "Sunflower", "Sesame", "Canola", "Oil Palm", "Coconut",
  "Coffee", "Tea", "Cocoa",
  "Cotton", "Sisal",
  "Sugarcane", "Sugar Beet",
  "Ginger", "Turmeric", "Garlic", "Chili",
];

const ScanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("Auto-detect");
  const [cropSearchOpen, setCropSearchOpen] = useState(false);
  const [cropSearch, setCropSearch] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const filteredCrops = useMemo(() => {
    if (!cropSearch) return CROP_OPTIONS;
    const q = cropSearch.toLowerCase();
    return CROP_OPTIONS.filter((c) => c.toLowerCase().includes(q));
  }, [cropSearch]);

  // Get GPS location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // Silently fail
    );
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyse = async () => {
    if (!imagePreview) return;
    setIsAnalysing(true);

    try {
      const { data, error } = await supabase.functions.invoke("detect-disease", {
        body: {
          imageBase64: imagePreview,
          selectedCrop: selectedCrop !== "Auto-detect" ? selectedCrop : undefined,
        },
      });

      if (error) throw new Error(error.message || "Analysis failed");

      if (data?.error) {
        toast({ title: "Analysis Error", description: data.error, variant: "destructive" });
        setIsAnalysing(false);
        return;
      }

      const diagnosis = data.diagnosis;

      // Save to database with GPS
      await supabase.from("scan_history").insert({
        crop: diagnosis.crop,
        is_healthy: diagnosis.is_healthy,
        disease_name: diagnosis.is_healthy ? null : diagnosis.disease_name,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        description: diagnosis.description,
        treatment: diagnosis.treatment,
        prevention: diagnosis.prevention,
        treatment_costs: diagnosis.treatment_costs,
        latitude: userLocation?.lat ?? null,
        longitude: userLocation?.lng ?? null,
      });

      navigate("/results", {
        state: {
          disease: {
            id: "live",
            name: diagnosis.disease_name,
            crop: diagnosis.crop,
            confidence: diagnosis.confidence,
            severity: diagnosis.severity,
            description: diagnosis.description,
            treatment: diagnosis.treatment,
            treatment_costs: diagnosis.treatment_costs,
            prevention: diagnosis.prevention,
          },
          imageUrl: imagePreview,
          isHealthy: diagnosis.is_healthy,
        },
      });
    } catch (err) {
      console.error("Scan error:", err);
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalysing(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setIsAnalysing(false);
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-1">Scan Crop Leaf</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Take or upload a clear photo of the affected leaf
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      <AnimatePresence mode="wait">
        {!imagePreview ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <button
              onClick={() => { fileInputRef.current?.setAttribute("capture", "environment"); fileInputRef.current?.click(); }}
              className="w-full diagnostic-card flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Take Photo</p>
                <p className="text-xs text-muted-foreground">Use your camera to capture a leaf</p>
              </div>
            </button>

            <button
              onClick={() => { fileInputRef.current?.removeAttribute("capture"); fileInputRef.current?.click(); }}
              className="w-full diagnostic-card flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Upload Image</p>
                <p className="text-xs text-muted-foreground">Choose a photo from your gallery</p>
              </div>
            </button>

            <div className="mt-6">
              <h3 className="font-bold text-sm mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Photograph a single leaf against a plain background",
                  "Ensure good lighting — natural daylight works best",
                  "Include both healthy and affected areas of the leaf",
                  "Keep the camera steady to avoid blurry images",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Crop selector with search */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1.5 block">Crop Type</label>
              <button
                type="button"
                onClick={() => !isAnalysing && setCropSearchOpen(!cropSearchOpen)}
                disabled={isAnalysing}
                className="w-full flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              >
                <span>{selectedCrop}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${cropSearchOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {cropSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-xl border bg-card shadow-lg">
                      <div className="flex items-center gap-2 px-3 py-2 border-b">
                        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Search crops…"
                          value={cropSearch}
                          onChange={(e) => setCropSearch(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {filteredCrops.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3">No crops found</p>
                        ) : (
                          filteredCrops.map((crop) => (
                            <button
                              key={crop}
                              type="button"
                              onClick={() => { setSelectedCrop(crop); setCropSearchOpen(false); setCropSearch(""); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-accent transition-colors ${selectedCrop === crop ? "font-semibold text-primary" : ""}`}
                            >
                              {selectedCrop === crop && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                              <span className={selectedCrop !== crop ? "ml-6" : ""}>{crop}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-muted-foreground mt-1">Select your crop or leave as auto-detect</p>
            </div>

            <div className="relative rounded-xl overflow-hidden mb-4 border">
              <img src={imagePreview} alt="Captured crop leaf" className="w-full aspect-[4/3] object-cover" />
              {!isAnalysing && (
                <button onClick={clearImage} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-foreground/60 flex items-center justify-center">
                  <X className="w-4 h-4 text-background" />
                </button>
              )}
            </div>

            {isAnalysing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <p className="text-sm font-medium">Analysing leaf with AI…</p>
                </div>
                <div className="w-full h-2 rounded-full bg-card overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: "90%" }} transition={{ duration: 8, ease: "easeOut" }} />
                </div>
                <p className="text-xs text-muted-foreground">This may take a few seconds…</p>
              </div>
            ) : (
              <button onClick={handleAnalyse} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform">
                Analyse Leaf
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanPage;
