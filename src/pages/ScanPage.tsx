import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { MOCK_DISEASES } from "@/lib/mockData";

const ScanPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyse = () => {
    setIsAnalysing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to results with mock disease
          const randomDisease = MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
          setTimeout(() => {
            navigate("/results", { state: { disease: randomDisease, imageUrl: imagePreview } });
          }, 200);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const clearImage = () => {
    setImagePreview(null);
    setIsAnalysing(false);
    setProgress(0);
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
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Camera capture */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "environment");
                  fileInputRef.current.click();
                }
              }}
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

            {/* Upload from gallery */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute("capture");
                  fileInputRef.current.click();
                }
              }}
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

            {/* Tips */}
            <div className="mt-6">
              <h3 className="font-bold text-sm mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Photograph a single leaf against a plain background
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Ensure good lighting — natural daylight works best
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Include both healthy and affected areas of the leaf
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  Keep the camera steady to avoid blurry images
                </li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Image preview */}
            <div className="relative rounded-xl overflow-hidden mb-4 border">
              <img
                src={imagePreview}
                alt="Captured crop leaf"
                className="w-full aspect-[4/3] object-cover"
              />
              {!isAnalysing && (
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-foreground/60 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-background" />
                </button>
              )}
            </div>

            {isAnalysing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <p className="text-sm font-medium">Analysing leaf…</p>
                </div>
                {/* Simple progress bar */}
                <div className="w-full h-2 rounded-full bg-card overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  AI model is processing your image…
                </p>
              </div>
            ) : (
              <button
                onClick={handleAnalyse}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform"
              >
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
