import { useLocation } from "wouter";
import { Home, Camera, Clock, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/history", label: "History", icon: Clock },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-lg mx-auto px-5 pb-5">
        <div className="glass rounded-2xl border border-white/10 shadow-lg shadow-black/20">
          <div className="flex items-center justify-around py-2">
            {/* Left nav items */}
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 ${
                    active
                      ? "text-emerald-400"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""}`} />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Center Scan Button */}
            <button
              onClick={() => navigate("/scanner")}
              className="relative -mt-6"
            >
              <div className={`w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform hover:scale-110 active:scale-95 ${
                location === "/scanner" ? "glow-emerald" : ""
              }`}>
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>

            {/* Right nav item */}
            {navItems.slice(2).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 ${
                    active
                      ? "text-emerald-400"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""}`} />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Settings */}
            <button
              onClick={() => navigate("/settings")}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 ${
                location === "/settings"
                  ? "text-emerald-400"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-[10px] mt-1 font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
