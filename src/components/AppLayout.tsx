import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import LanguageSwitcher from "./LanguageSwitcher";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background">
      <div className="flex justify-end px-4 pt-3">
        <LanguageSwitcher />
      </div>
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
