import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, LogOut, Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const bgClass = theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
    : "bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50";

  const cardBgClass = theme === "dark"
    ? "bg-gray-800 border border-gray-700"
    : "bg-white";

  const headerBgClass = theme === "dark"
    ? "bg-gradient-to-r from-gray-700 to-gray-600"
    : "bg-gradient-to-r from-green-50 to-orange-50";

  const textColorClass = theme === "dark" ? "text-white" : "text-amber-950";
  const secondaryTextClass = theme === "dark" ? "text-gray-400" : "text-amber-700";
  const inputBgClass = theme === "dark"
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-amber-50 border-amber-200 text-amber-950";

  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 ${bgClass}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className={`p-2 rounded-full transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-white text-amber-900"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className={`text-3xl font-bold transition-colors duration-300 ${textColorClass}`}>
                My Profile
              </h1>
              <p className={`transition-colors duration-300 ${secondaryTextClass}`}>
                Personalize your ScanEat experience
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${
              theme === "dark"
                ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Profile Card */}
        <Card className={`border-0 shadow-lg rounded-3xl mb-6 transition-colors duration-300 ${cardBgClass}`}>
          <CardHeader className={`rounded-t-3xl transition-colors duration-300 ${headerBgClass}`}>
            <CardTitle className={`transition-colors duration-300 ${textColorClass}`}>
              User Information
            </CardTitle>
            <CardDescription className={`transition-colors duration-300 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label className={`font-semibold transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-amber-900"
                }`}>
                  Name
                </Label>
                <Input
                  value={user?.name || ""}
                  disabled
                  className={`mt-2 transition-colors duration-300 ${inputBgClass}`}
                />
              </div>
              <div>
                <Label className={`font-semibold transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-amber-900"
                }`}>
                  Email
                </Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className={`mt-2 transition-colors duration-300 ${inputBgClass}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className={`border-0 shadow-lg rounded-3xl mb-6 transition-colors duration-300 ${cardBgClass}`}>
          <CardHeader className={`rounded-t-3xl transition-colors duration-300 ${headerBgClass}`}>
            <CardTitle className={`transition-colors duration-300 ${textColorClass}`}>
              Dietary Preferences
            </CardTitle>
            <CardDescription className={`transition-colors duration-300 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Help us personalize your recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <Label className={`font-semibold block mb-2 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-300" : "text-amber-900"
              }`}>
                Dietary Type
              </Label>
              <Select value={dietaryType} onValueChange={setDietaryType}>
                <SelectTrigger className={`transition-colors duration-300 ${
                  theme === "dark"
                    ? "border-gray-600 text-white bg-gray-700"
                    : "border-amber-200 text-amber-950 bg-white"
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={`font-semibold block mb-2 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-300" : "text-amber-900"
              }`}>
                Allergies
              </Label>
              <Input
                placeholder="e.g., peanuts, shellfish, dairy"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className={`transition-colors duration-300 ${
                  theme === "dark"
                    ? "border-gray-600 text-white bg-gray-700 placeholder:text-gray-400"
                    : "border-amber-200 text-amber-950 placeholder:text-amber-600"
                }`}
              />
            </div>

            <div>
              <Label className={`font-semibold block mb-2 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-300" : "text-amber-900"
              }`}>
                Health Goals
              </Label>
              <Select value={healthGoals} onValueChange={setHealthGoals}>
                <SelectTrigger className={`transition-colors duration-300 ${
                  theme === "dark"
                    ? "border-gray-600 text-white bg-gray-700"
                    : "border-amber-200 text-amber-950 bg-white"
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                  <SelectItem value="balanced">Balanced Diet</SelectItem>
                  <SelectItem value="diabetes">Diabetes Management</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={`font-semibold block mb-2 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-300" : "text-amber-900"
              }`}>
                Region
              </Label>
              <Input
                placeholder="e.g., India, USA, UK"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={`transition-colors duration-300 ${
                  theme === "dark"
                    ? "border-gray-600 text-white bg-gray-700 placeholder:text-gray-400"
                    : "border-amber-200 text-amber-950 placeholder:text-amber-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className={`flex-1 transition-colors duration-300 ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-amber-200 text-amber-900 hover:bg-amber-50"
              }`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-green-400 to-orange-400 hover:from-green-500 hover:to-orange-500 text-white font-semibold rounded-full"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center justify-center gap-2 transition-all duration-300 ${
              theme === "dark"
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-lg hover:shadow-red-500/50"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-lg hover:shadow-red-500/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <LogOut className="w-5 h-5" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
