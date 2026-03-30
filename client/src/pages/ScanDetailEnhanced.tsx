import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Heart, AlertCircle, TrendingUp, Droplets, Zap, Shield,
  ChevronDown, ChevronUp, Download, ArrowLeft, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { SocialShareCard } from "@/components/SocialShareCard";

export function ScanDetailEnhanced() {
  const [, params] = useRoute("/scan/:id");
  const [, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vitamins: false,
    minerals: false,
    allergens: false,
    healthBenefits: true,
  });

  const scanId = params?.id || "";
  const { data: scan, isLoading, error } = trpc.food.getScanDetail.useQuery(
    { id: scanId },
    { enabled: !!scanId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-3 animate-spin-slow" />
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading scan details...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-5">
        <div className="glass-card p-8 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">Scan Not Found</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mb-5">This scan could not be loaded.</p>
          <Button onClick={() => setLocation("/history")} className="gradient-primary text-white border-0 rounded-xl">
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  const healthScore = typeof scan.healthScore === "string" ? parseInt(scan.healthScore) : scan.healthScore || 0;
  const confidence = parseFloat(scan.confidenceScore || "0");
  const rawAnalysis = (scan.rawAnalysis as any) || {};

  const getScoreColor = (s: number) => s >= 8 ? "text-emerald-400" : s >= 5 ? "text-amber-400" : "text-red-400";
  const getScoreBg = (s: number) => s >= 8 ? "from-emerald-500/20" : s >= 5 ? "from-amber-500/20" : "from-red-500/20";
  const getScoreRing = (s: number) => s >= 8 ? "stroke-emerald-400" : s >= 5 ? "stroke-amber-400" : "stroke-red-400";

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (healthScore / 10) * circumference;

  return (
    <div className="min-h-screen pb-28 bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => setLocation("/history")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[hsl(var(--foreground))] truncate">{scan.foodName}</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(scan.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        {/* Health Score - Circular Ring */}
        <div className={`glass-card p-6 bg-gradient-to-br ${getScoreBg(healthScore)} to-transparent animate-scale-in`}>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  className={getScoreRing(healthScore)}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(healthScore)}`}>{healthScore}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 ${getScoreColor(healthScore)}`} />
                <h3 className="font-bold text-[hsl(var(--foreground))]">Health Score</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
                {healthScore >= 8 ? "Excellent choice!" : healthScore >= 5 ? "Balanced choice" : "Consume in moderation"}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-32">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${confidence * 100}%` }} />
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{(confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          {[
            { label: "Calories", value: scan.calories, unit: "kcal", color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Protein", value: `${scan.protein}g`, unit: "", color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Carbs", value: `${scan.carbs}g`, unit: "", color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Fats", value: `${scan.fats}g`, unit: "", color: "text-purple-400", bg: "bg-purple-500/10" },
          ].map((macro) => (
            <div key={macro.label} className="glass-card p-4">
              <p className={`text-xs font-medium ${macro.color} mb-1`}>{macro.label}</p>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{macro.value}</p>
              {macro.unit && <p className={`text-xs ${macro.color} mt-0.5`}>{macro.unit}</p>}
            </div>
          ))}
        </div>

        {/* Additional Macros */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Fiber", value: rawAnalysis.fiber || "N/A", unit: "g" },
            { label: "Sugar", value: rawAnalysis.sugar || "N/A", unit: "g" },
            { label: "Sodium", value: rawAnalysis.sodium || "N/A", unit: "mg" },
          ].map((item) => (
            <div key={item.label} className="glass-card p-3 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{item.label}</p>
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">{item.value}<span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">{item.unit}</span></p>
            </div>
          ))}
        </div>

        {/* Collapsible Sections */}
        {[
          { key: "vitamins", label: "Vitamins", icon: <Shield className="w-4 h-4 text-green-400" />, data: rawAnalysis.vitamins || [] },
          { key: "minerals", label: "Minerals", icon: <Droplets className="w-4 h-4 text-blue-400" />, data: rawAnalysis.minerals || [] },
        ].map((section) => section.data.length > 0 && (
          <div key={section.key} className="glass-card overflow-hidden">
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {section.icon}
                <span className="font-semibold text-sm text-[hsl(var(--foreground))]">{section.label}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] bg-white/5 px-2 py-0.5 rounded-full">{section.data.length}</span>
              </div>
              {expandedSections[section.key] ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
            </button>
            {expandedSections[section.key] && (
              <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
                {section.data.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.amount} {item.unit}</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-400">{item.dailyValue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Allergens */}
        {(rawAnalysis.allergens || []).length > 0 && (
          <div className="glass-card overflow-hidden">
            <button onClick={() => toggleSection("allergens")} className="w-full px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Allergens</span>
              </div>
              {expandedSections.allergens ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
            </button>
            {expandedSections.allergens && (
              <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
                {(rawAnalysis.allergens || []).map((a: any, i: number) => (
                  <div key={i} className={`px-3 py-2 rounded-lg text-sm ${a.severity === "critical" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>
                    {a.name} — <span className="capitalize">{a.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Health Benefits */}
        {(rawAnalysis.healthBenefits || []).length > 0 && (
          <div className="glass-card overflow-hidden">
            <button onClick={() => toggleSection("healthBenefits")} className="w-full px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Health Benefits</span>
              </div>
              {expandedSections.healthBenefits ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
            </button>
            {expandedSections.healthBenefits && (
              <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
                {(rawAnalysis.healthBenefits || []).map((benefit: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{benefit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        {rawAnalysis.healthRecommendation && (
          <div className="glass-card p-5 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-[hsl(var(--foreground))]">Recommendation</h3>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{rawAnalysis.healthRecommendation}</p>
          </div>
        )}

        {/* Social Share */}
        <SocialShareCard
          foodName={scan.foodName}
          calories={typeof scan.calories === "string" ? parseInt(scan.calories) : scan.calories}
          protein={typeof scan.protein === "string" ? parseInt(scan.protein) : scan.protein}
          carbs={typeof scan.carbs === "string" ? parseInt(scan.carbs) : scan.carbs}
          fats={typeof scan.fats === "string" ? parseInt(scan.fats) : scan.fats}
          healthScore={healthScore}
          scanId={scanId}
          imageUrl={scan.imageUrl || undefined}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => setLocation("/history")}
            className="flex-1 h-12 gradient-primary text-white font-semibold rounded-xl border-0 hover:opacity-90"
          >
            Back to History
          </Button>
        </div>
      </div>
    </div>
  );
}
