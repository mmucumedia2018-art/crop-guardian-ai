import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Shield, Leaf, TrendingUp } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AgriShield</h1>
          <p className="text-xs text-muted-foreground">AI Disease Detector</p>
        </div>
      </div>

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
              Take a photo of a leaf to detect diseases instantly
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Crops", value: "38+", icon: Leaf },
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
          { step: 2, title: "Analyse", desc: "AI processes the image in seconds" },
          { step: 3, title: "Diagnose", desc: "Get disease identification & treatment advice" },
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
