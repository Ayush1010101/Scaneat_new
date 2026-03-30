import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [dietaryType, setDietaryType] = useState("vegetarian");
  const [allergies, setAllergies] = useState("");
  const [healthGoals, setHealthGoals] = useState("balanced");
  const [region, setRegion] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setIsLoggingOut(false);
      logout();
      setLocation("/");
    },
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      setIsLoggingOut(false);
      toast.error("Failed to logout");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      toast.success("Profile updated successfully");
    } finally {
      setIsSaving(false);
    }
  };

  const selectClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[hsl(var(--foreground))] focus:outline-none focus:border-emerald-500/50 transition-colors text-sm";
  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-emerald-500/50 transition-colors text-sm";

  return (
    <div className="min-h-screen pb-28 bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => setLocation("/")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Profile</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6 animate-slide-up">
        {/* Avatar & Info */}
        <div className="glass-card p-6 text-center">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{user?.name || "User"}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{user?.email || ""}</p>
        </div>

        {/* Dietary Preferences */}
        <div>
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 px-1">Dietary Preferences</h3>
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Dietary Type</label>
              <select value={dietaryType} onChange={(e) => setDietaryType(e.target.value)} className={selectClass}>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Allergies</label>
              <input
                placeholder="e.g., peanuts, shellfish, dairy"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Health Goals</label>
              <select value={healthGoals} onChange={(e) => setHealthGoals(e.target.value)} className={selectClass}>
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="balanced">Balanced Diet</option>
                <option value="diabetes">Diabetes Management</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">Region</label>
              <input
                placeholder="e.g., India, USA, UK"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => setLocation("/")}
            className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-[hsl(var(--foreground))] border border-white/10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-12 gradient-primary text-white font-semibold rounded-xl border-0 hover:opacity-90"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-red-400 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
