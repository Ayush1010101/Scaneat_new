import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut, User, Bell, Lock, Settings as SettingsIcon, ChevronRight, Moon, Sun, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

export function Settings() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    autoSave: true,
    shareAnalytics: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => setLocation("/"),
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-white/10"
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
        checked ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen pb-28 bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => setLocation("/")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6 animate-slide-up">
        {/* Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 px-1">Appearance</h3>
          <div className="glass-card divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">Dark Mode</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Use dark theme</p>
                </div>
              </div>
              <Toggle checked={theme === "dark"} onChange={toggleTheme} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 px-1">Notifications</h3>
          <div className="glass-card divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">Push Notifications</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Receive app notifications</p>
                </div>
              </div>
              <Toggle checked={settings.notifications} onChange={() => handleToggle("notifications")} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">Email Updates</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Weekly nutrition tips</p>
                </div>
              </div>
              <Toggle checked={settings.emailUpdates} onChange={() => handleToggle("emailUpdates")} />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div>
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 px-1">Privacy & Data</h3>
          <div className="glass-card divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">Share Analytics</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Help improve ScanEat</p>
                </div>
              </div>
              <Toggle checked={settings.shareAnalytics} onChange={() => handleToggle("shareAnalytics")} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">Auto-Save Scans</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Save scan history automatically</p>
                </div>
              </div>
              <Toggle checked={settings.autoSave} onChange={() => handleToggle("autoSave")} />
            </div>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 px-1">About</h3>
          <div className="glass-card divide-y divide-white/5">
            {["Privacy Policy", "Terms of Service", "Help & Support"].map((item) => (
              <button key={item} className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors">
                <span className="text-sm text-[hsl(var(--foreground))]">{item}</span>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-red-400 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] opacity-40">ScanEat v1.0.0</p>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="glass-card p-6 max-w-sm w-full animate-scale-in">
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">Logout?</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <Button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-[hsl(var(--foreground))] border-0 rounded-xl">Cancel</Button>
              <Button onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
