import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, Grid3x3, List, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";

export default function ScanHistory() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedScans, setSelectedScans] = useState<number[]>([]);

  const { data: scans, isLoading, refetch } = trpc.food.getScanHistory.useQuery();
  const deleteScanMutation = trpc.food.deleteScan.useMutation({
    onSuccess: () => {
      toast.success("Scan deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete scan");
    },
  });

  const handleDeleteScan = (scanId: number) => {
    if (window.confirm("Are you sure you want to delete this scan?")) {
      deleteScanMutation.mutate({ id: String(scanId) });
    }
  };

  const handleSelectScan = (scanId: number) => {
    setSelectedScans((prev) =>
      prev.includes(scanId)
        ? prev.filter((id) => id !== scanId)
        : [...prev, scanId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedScans.length === 0) {
      toast.error("Please select scans to delete");
      return;
    }
    if (window.confirm(`Delete ${selectedScans.length} scan(s)?`)) {
      selectedScans.forEach((scanId) => {
        deleteScanMutation.mutate({ id: String(scanId) });
      });
      setSelectedScans([]);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center pb-24 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50"
      }`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Loading your scans...
          </p>
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className={`p-2 rounded-full transition-colors ${
                  theme === "dark"
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-orange-100 text-gray-700"
                }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Scan History
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? theme === "dark"
                      ? "bg-orange-600 text-white"
                      : "bg-orange-400 text-white"
                    : theme === "dark"
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-orange-100 text-gray-600"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-400 text-white"
                    : theme === "dark"
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-orange-100 text-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Total scans: <span className="font-bold">{scans?.length || 0}</span>
            </p>
            {selectedScans.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete {selectedScans.length}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {!scans || scans.length === 0 ? (
          <div className={`rounded-2xl p-8 md:p-12 text-center transition-colors ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-orange-100"
          }`}>
            <div className="text-5xl md:text-6xl mb-4">📭</div>
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              No Scans Yet
            </h2>
            <p className={`mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Start scanning food to build your nutrition history
            </p>
            <button
              onClick={() => navigate("/scanner")}
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold rounded-full transition-all"
            >
              Scan Your First Food
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {scans.map((scan: any) => (
              <div
                key={scan.id}
                onClick={() => handleSelectScan(scan.id)}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                  selectedScans.includes(scan.id)
                    ? theme === "dark"
                      ? "ring-2 ring-orange-500 bg-gray-700"
                      : "ring-2 ring-orange-400 bg-orange-50"
                    : theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-orange-50"
                }`}
              >
                {scan.imageUrl ? (
                  <img
                    src={scan.imageUrl}
                    alt={scan.foodName}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-5xl">
                    🍽️
                  </div>
                )}
                <div className="p-4">
                  <h3 className={`font-bold text-lg mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {scan.foodName}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {Number(scan.calories)} cal • {format(new Date(scan.createdAt), "MMM d")}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScan(scan.id);
                    }}
                    className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan: any) => (
              <div
                key={scan.id}
                onClick={() => handleSelectScan(scan.id)}
                className={`rounded-2xl p-4 md:p-6 cursor-pointer transition-all ${
                  selectedScans.includes(scan.id)
                    ? theme === "dark"
                      ? "ring-2 ring-orange-500 bg-gray-700"
                      : "ring-2 ring-orange-400 bg-orange-50"
                    : theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-orange-50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {scan.imageUrl ? (
                      <img
                        src={scan.imageUrl}
                        alt={scan.foodName}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0">
                        🍽️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {scan.foodName}
                      </h3>
                      <p className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {Number(scan.calories)} cal • {format(new Date(scan.createdAt), "MMM d, yyyy")}
                      </p>
                      {scan.foodType && (
                        <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                          theme === "dark"
                            ? "bg-blue-900 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {String(scan.foodType)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/scan/${scan.id}`)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScan(scan.id);
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
