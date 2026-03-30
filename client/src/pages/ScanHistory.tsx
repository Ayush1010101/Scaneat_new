import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, Grid3x3, List, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ScanHistory() {
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: scans, isLoading, refetch } = trpc.food.getScanHistory.useQuery();
  const deleteScanMutation = trpc.food.deleteScan.useMutation({
    onSuccess: () => {
      toast.success("Scan deleted");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete scan");
    },
  });

  const handleDeleteScan = (scanId: number) => {
    if (window.confirm("Delete this scan?")) {
      deleteScanMutation.mutate({ id: String(scanId) });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">History</h1>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{scans?.length || 0} scans</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-emerald-500/20 text-emerald-400" : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {!scans || scans.length === 0 ? (
          <div className="glass-card p-10 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">No Scans Yet</h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6">Start scanning food to build your nutrition history</p>
            <button
              onClick={() => navigate("/scanner")}
              className="px-6 py-3 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Scan Your First Food
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {scans.map((scan: any, i: number) => (
              <button
                key={scan.id}
                onClick={() => navigate(`/scan/${scan.id}`)}
                className="glass-card overflow-hidden text-left animate-scale-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {scan.imageUrl ? (
                  <img src={scan.imageUrl} alt={scan.foodName} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 gradient-primary flex items-center justify-center text-4xl">🍽️</div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] truncate">{scan.foodName}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-emerald-400 font-medium">{Number(scan.calories)} cal</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{format(new Date(scan.createdAt), "MMM d")}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan: any, i: number) => (
              <div
                key={scan.id}
                className="glass-card p-4 flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <button onClick={() => navigate(`/scan/${scan.id}`)} className="flex items-center gap-4 flex-1 min-w-0">
                  {scan.imageUrl ? (
                    <img src={scan.imageUrl} alt={scan.foodName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[hsl(var(--foreground))] truncate">{scan.foodName}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      <span className="text-emerald-400">{Number(scan.calories)} cal</span> · {format(new Date(scan.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteScan(scan.id)}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
