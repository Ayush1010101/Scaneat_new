import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Home, Camera, History, Crown, Settings as SettingsIcon } from "lucide-react";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/scanner", label: "Scan", icon: Camera },
    { path: "/history", label: "History", icon: History },
    { path: "/premium", label: "Premium", icon: Crown },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[hsl(var(--background))] to-transparent backdrop-blur-xl border-t border-white/10 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Navigation Items */}
        <div className="flex items-center justify-around flex-1 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
                  active
                    ? "bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Button */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
          {user && (
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[hsl(var(--accent))]/10 hover:bg-[hsl(var(--accent))]/20 transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5 text-[hsl(var(--accent))]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
