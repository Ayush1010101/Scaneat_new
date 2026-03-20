import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Camera, History, Home, LogOut, User, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/scanner", icon: Camera, label: "Scan" },
    { path: "/history", icon: History, label: "History" },
    { path: "/premium", icon: Crown, label: "Premium" },
  ];

  return (
    <nav className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/food-lens-logo.png" alt="Food Lens" className="w-10 h-10" />
            <span className="font-bold text-amber-950 text-lg hidden sm:inline">Food Lens</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-green-100 to-orange-100 text-green-700"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="text-amber-700 hover:bg-amber-50 rounded-full"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </Button>
            {user?.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="text-amber-700 hover:bg-amber-50 rounded-full"
                title="Admin"
              >
                <Crown className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-amber-700 hover:bg-amber-50 rounded-full"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-green-100 to-orange-100 text-green-700"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
