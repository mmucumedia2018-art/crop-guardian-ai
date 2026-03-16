import { useLocation, useNavigate } from "react-router-dom";
import { Home, Camera, Clock } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="max-w-md mx-auto flex items-end justify-around px-4 pb-2 pt-1">
        {/* Home */}
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-display font-medium">Home</span>
        </button>

        {/* Scan - Hero Button */}
        <button
          onClick={() => navigate("/scan")}
          className="relative -mt-6 flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center scan-button-glow active:scale-95 transition-transform">
            <Camera className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-[11px] font-display font-medium text-primary mt-1">Scan</span>
        </button>

        {/* History */}
        <button
          onClick={() => navigate("/history")}
          className={`flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${
            isActive("/history") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[11px] font-display font-medium">History</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
