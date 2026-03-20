import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertCircle, TrendingUp, Eye, Flag, BarChart3, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [debugMode, setDebugMode] = useState(false);
  const [selectedScan, setSelectedScan] = useState<string | null>(null);

  // Get environment variable for founder check
  const isFounder = user?.role === "admin";

  // Fetch scan history for monitoring
  const { data: scans = [] } = trpc.food.getScanHistory.useQuery(undefined, {
    enabled: isFounder,
  });

  // Only allow founder/admin users
  if (!isFounder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md text-center border border-amber-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-950 mb-2">Access Denied</h1>
          <p className="text-amber-700 mb-6">
            This admin panel is only available to the founder. You don't have permission to access this area.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-gradient-to-r from-green-400 to-orange-400 hover:from-green-500 hover:to-orange-500 text-white font-semibold rounded-full py-3"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalScans = scans.length;
  const avgConfidence =
    scans.length > 0
      ? (
          scans.reduce((sum, scan: any) => sum + (Number(scan.confidenceScore) || 0.85), 0) /
          scans.length
        ).toFixed(2)
      : "0.00";

  const failedScans = scans.filter(
    (scan: any) =>
      scan.foodName === "Unknown Food" ||
      scan.healthRecommendation?.includes("Unable to provide")
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-white rounded-full transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-amber-900" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-950">Founder Dashboard</h1>
            <p className="text-amber-700">Monitor AI analysis and system health</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Total Scans */}
          <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-700 text-sm font-semibold">Total Scans</p>
                <p className="text-3xl font-bold text-amber-950 mt-2">{totalScans}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-2xl">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Avg Confidence */}
          <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-700 text-sm font-semibold">Avg Confidence</p>
                <p className="text-3xl font-bold text-amber-950 mt-2">{avgConfidence}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Failed Scans */}
          <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-700 text-sm font-semibold">Fallback Used</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{failedScans}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-700 text-sm font-semibold">Success Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {totalScans > 0 ? (((totalScans - failedScans) / totalScans) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-2xl">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Debug Mode Toggle */}
        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-amber-950 font-semibold">Debug Mode</p>
                <p className="text-amber-700 text-sm">Show raw AI responses and parsed outputs</p>
              </div>
            </div>
            <Button
              onClick={() => setDebugMode(!debugMode)}
              className={`rounded-full px-6 font-semibold ${
                debugMode
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900"
              }`}
            >
              {debugMode ? "ON" : "OFF"}
            </Button>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-orange-50 p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Recent Scans
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-100 bg-amber-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                    Food
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                    Calories
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 10).map((scan: any) => (
                  <tr key={scan.id} className="border-b border-amber-50 hover:bg-amber-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-amber-950 font-medium">{scan.foodName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          scan.isVegan === "true"
                            ? "bg-green-100 text-green-700"
                            : scan.isVegetarian === "true"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {scan.isVegan === "true"
                          ? "Vegan"
                          : scan.isVegetarian === "true"
                            ? "Vegetarian"
                            : "Non-Veg"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-amber-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${(Number(scan.confidenceScore) || 0.85) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-amber-900">
                          {((Number(scan.confidenceScore) || 0.85) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-amber-950 font-medium">
                      {scan.calories} kcal
                    </td>
                    <td className="px-6 py-4 text-sm text-amber-700">
                      {format(new Date(scan.createdAt), "MMM dd, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {scan.foodName === "Unknown Food" ? (
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <Flag className="w-4 h-4" />
                          Fallback
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">✓ Success</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {scans.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-amber-700">No scans yet. Start scanning food to see data here.</p>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {debugMode && scans.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
            <h2 className="text-xl font-bold text-amber-950 mb-4">Debug Information</h2>
            <div className="bg-amber-50 rounded-2xl p-4 font-mono text-xs text-amber-900 max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(scans[0], null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
