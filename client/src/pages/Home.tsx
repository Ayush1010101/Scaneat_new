import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Camera, Clock, Crown, Settings, Home as HomeIcon } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-orange-50"
      }`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-400 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50"
      }`}>
        <div className="text-center max-w-md">
          <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663281488917/HtBitrgx8pbd4HxixS3EyC/scaneat-logo-WXd6JJbE4Br58sHw9and7v.webp" alt="ScanEat" className="w-32 h-32 mx-auto mb-6" />
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            ScanEat
          </h1>
          <p className={`text-lg mb-8 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            Scan. Analyze. Eat Smart.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 rounded-full text-lg">
              Login to Start
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
      } backdrop-blur-md border-b ${
        theme === "dark" ? "border-gray-700" : "border-orange-100"
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663281488917/HtBitrgx8pbd4HxixS3EyC/scaneat-logo-WXd6JJbE4Br58sHw9and7v.webp" alt="ScanEat" className="w-10 h-10" />
            <h1 className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              ScanEat
            </h1>
          </div>
          <button
            onClick={() => setLocation("/profile")}
            className={`p-2 rounded-full transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-orange-100 text-gray-700"
            }`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Welcome Card */}
        <div className="mb-8">
          <div className={`rounded-3xl p-6 md:p-8 transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-r from-orange-600 to-orange-500"
              : "bg-gradient-to-r from-orange-400 to-yellow-400"
          } text-white shadow-lg`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome, {user.name}! 👋
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              Ready to discover what's in your food?
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Scan Food Card */}
          <button
            onClick={() => setLocation("/scanner")}
            className={`rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700 hover:border-orange-500"
                : "bg-white border border-orange-100 hover:border-orange-400"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                <Camera className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className={`text-xl md:text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Scan Food
              </h3>
              <p className={`text-sm md:text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Analyze any food instantly
              </p>
            </div>
          </button>

          {/* History Card */}
          <button
            onClick={() => setLocation("/history")}
            className={`rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700 hover:border-blue-500"
                : "bg-white border border-blue-100 hover:border-blue-400"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg">
                <Clock className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className={`text-xl md:text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                My History
              </h3>
              <p className={`text-sm md:text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                View your scan history
              </p>
            </div>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Premium Card */}
          <button
            onClick={() => setLocation("/premium")}
            className={`rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700 hover:border-purple-500"
                : "bg-white border border-purple-100 hover:border-purple-400"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
                <Crown className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className={`text-xl md:text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Premium
              </h3>
              <p className={`text-sm md:text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Unlock advanced features
              </p>
            </div>
          </button>

          {/* Profile Card */}
          <button
            onClick={() => setLocation("/profile")}
            className={`rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700 hover:border-green-500"
                : "bg-white border border-green-100 hover:border-green-400"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mb-4 shadow-lg">
                <Settings className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className={`text-xl md:text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Profile
              </h3>
              <p className={`text-sm md:text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Manage your preferences
              </p>
            </div>
          </button>
        </div>

        {/* Recent Scans Section */}
        <div className="mb-8">
          <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Recent Scans
          </h3>
          <div className={`rounded-2xl p-8 md:p-12 text-center transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-orange-100"
          }`}>
            <div className="text-5xl md:text-6xl mb-4">📸</div>
            <p className={`text-lg md:text-xl ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              No scans yet. Start by scanning your first food!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-800 border-t border-gray-700" : "bg-white border-t border-orange-100"
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-around">
          <button
            onClick={() => setLocation("/")}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
              theme === "dark"
                ? "text-orange-400 bg-gray-700"
                : "text-orange-500 bg-orange-50"
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setLocation("/scanner")}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs font-medium">Scan</span>
          </button>
          <button
            onClick={() => setLocation("/history")}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Clock className="w-6 h-6" />
            <span className="text-xs font-medium">History</span>
          </button>
          <button
            onClick={() => setLocation("/profile")}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
