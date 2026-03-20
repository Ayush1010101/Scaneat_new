import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Heart,
  AlertCircle,
  TrendingUp,
  Droplets,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { SocialShareCard } from "@/components/SocialShareCard";

export function ScanDetailEnhanced() {
  const [, params] = useRoute("/scan/:id");
  const [, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vitamins: true,
    minerals: true,
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading scan details...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-6 max-w-sm mx-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white text-center mb-2">Scan Not Found</h2>
          <p className="text-slate-300 text-center mb-6">This scan could not be loaded.</p>
          <Button
            onClick={() => setLocation("/history")}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Back to History
          </Button>
        </Card>
      </div>
    );
  }

  const getHealthScoreColor = (score: number | string | null) => {
    const numScore = typeof score === 'string' ? parseInt(score) : (score || 0);
    if (numScore >= 8) return "text-green-400";
    if (numScore >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getHealthScoreBg = (score: number | string | null) => {
    const numScore = typeof score === 'string' ? parseInt(score) : (score || 0);
    if (numScore >= 8) return "bg-green-900/30 border-green-700";
    if (numScore >= 5) return "bg-yellow-900/30 border-yellow-700";
    return "bg-red-900/30 border-red-700";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-500";
    if (confidence >= 0.7) return "bg-yellow-500";
    return "bg-red-500";
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const rawAnalysis = scan.rawAnalysis as any || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            onClick={() => setLocation("/history")}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{scan.foodName}</h1>
            <p className="text-sm text-slate-400">
              {new Date(scan.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Health Score Card */}
        <Card className={`p-8 border-2 ${getHealthScoreBg(scan.healthScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className={`w-6 h-6 ${getHealthScoreColor(scan.healthScore)}`} />
              <h2 className="text-2xl font-bold text-white">Health Score</h2>
            </div>
            <div className={`text-5xl font-bold ${getHealthScoreColor(scan.healthScore)}`}>
              {typeof scan.healthScore === 'string' ? parseInt(scan.healthScore) : scan.healthScore || 0}/10
            </div>
          </div>
          <p className="text-slate-300 mb-4">
            {(() => {
              const score = typeof scan.healthScore === 'string' ? parseInt(scan.healthScore) : scan.healthScore || 0;
              if (score >= 8) return "Excellent nutritional choice! This food is highly beneficial for your health.";
              if (score >= 5) return "Balanced choice. This food has good nutritional value with some considerations.";
              return "Consume in moderation. This food should be balanced with healthier options.";
            })()}
          </p>

          {/* Confidence Score */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm text-slate-300">Analysis Confidence:</span>
            <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getConfidenceColor(parseFloat(scan.confidenceScore || "0"))}`}
                style={{
                  width: `${(parseFloat(scan.confidenceScore || "0") * 100).toFixed(0)}%`,
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-slate-200">
              {(parseFloat(scan.confidenceScore || "0") * 100).toFixed(0)}%
            </span>
          </div>
        </Card>

        {/* Main Nutrition Facts */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            Nutrition Facts
          </h2>

          {/* Serving Size */}
          <div className="mb-6 pb-6 border-b border-slate-700">
            <p className="text-slate-400 text-sm mb-2">Serving Size</p>
            <p className="text-xl font-semibold text-white">{scan.portionSize || "1 serving"}</p>
          </div>

          {/* Macro Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-lg p-4 border border-orange-700">
              <p className="text-orange-300 text-sm font-medium mb-1">Calories</p>
              <p className="text-3xl font-bold text-white">{scan.calories}</p>
              <p className="text-xs text-orange-300 mt-2">kcal</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-lg p-4 border border-blue-700">
              <p className="text-blue-300 text-sm font-medium mb-1">Protein</p>
              <p className="text-3xl font-bold text-white">{scan.protein}g</p>
              <p className="text-xs text-blue-300 mt-2">4 cal/g</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-lg p-4 border border-yellow-700">
              <p className="text-yellow-300 text-sm font-medium mb-1">Carbs</p>
              <p className="text-3xl font-bold text-white">{scan.carbs}g</p>
              <p className="text-xs text-yellow-300 mt-2">4 cal/g</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-lg p-4 border border-purple-700">
              <p className="text-purple-300 text-sm font-medium mb-1">Fats</p>
              <p className="text-3xl font-bold text-white">{scan.fats}g</p>
              <p className="text-xs text-purple-300 mt-2">9 cal/g</p>
            </div>
          </div>

          {/* Additional Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Fiber</p>
              <p className="text-2xl font-bold text-white">{rawAnalysis.fiber || "N/A"}g</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Sugar</p>
              <p className="text-2xl font-bold text-white">{rawAnalysis.sugar || "N/A"}g</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Sodium</p>
              <p className="text-2xl font-bold text-white">{rawAnalysis.sodium || "N/A"}mg</p>
            </div>
          </div>
        </Card>

        {/* Vitamins Section */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection("vitamins")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Vitamins</h3>
            </div>
            {expandedSections.vitamins ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSections.vitamins && (
            <div className="px-6 pb-6 space-y-3 border-t border-slate-700">
              {(rawAnalysis.vitamins || []).map((vitamin: any, idx: number) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white">{vitamin.name}</p>
                    <p className="text-sm text-green-400 font-semibold">{vitamin.dailyValue}</p>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{vitamin.benefits}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {vitamin.amount} {vitamin.unit}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        vitamin.deficiencyRisk === "low"
                          ? "bg-green-900/50 text-green-300"
                          : vitamin.deficiencyRisk === "medium"
                            ? "bg-yellow-900/50 text-yellow-300"
                            : "bg-red-900/50 text-red-300"
                      }`}
                    >
                      {vitamin.deficiencyRisk} risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Minerals Section */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection("minerals")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-white">Minerals</h3>
            </div>
            {expandedSections.minerals ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSections.minerals && (
            <div className="px-6 pb-6 space-y-3 border-t border-slate-700">
              {(rawAnalysis.minerals || []).map((mineral: any, idx: number) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white">{mineral.name}</p>
                    <p className="text-sm text-blue-400 font-semibold">{mineral.dailyValue}</p>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{mineral.benefits}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {mineral.amount} {mineral.unit} • Bioavailability: {mineral.bioavailability}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        mineral.deficiencyRisk === "low"
                          ? "bg-green-900/50 text-green-300"
                          : mineral.deficiencyRisk === "medium"
                            ? "bg-yellow-900/50 text-yellow-300"
                            : "bg-red-900/50 text-red-300"
                      }`}
                    >
                      {mineral.deficiencyRisk} risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Allergens Section */}
        {(rawAnalysis.allergens || []).length > 0 && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <button
              onClick={() => toggleSection("allergens")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-white">Allergens</h3>
              </div>
              {expandedSections.allergens ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expandedSections.allergens && (
              <div className="px-6 pb-6 space-y-2 border-t border-slate-700">
                {(rawAnalysis.allergens || []).map((allergen: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      allergen.severity === "critical"
                        ? "bg-red-900/30 border border-red-700"
                        : allergen.severity === "moderate"
                          ? "bg-yellow-900/30 border border-yellow-700"
                          : "bg-orange-900/30 border border-orange-700"
                    }`}
                  >
                    <p className="font-medium text-white">{allergen.name}</p>
                    <p className="text-xs text-slate-300 capitalize">
                      Severity: {allergen.severity}
                    </p>
                  </div>
                ))}
              </div>
            )}
        </Card>
        )}

        {/* Health Benefits */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection("healthBenefits")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Health Benefits</h3>
            </div>
            {expandedSections.healthBenefits ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSections.healthBenefits && (
            <div className="px-6 pb-6 space-y-2 border-t border-slate-700">
              {(rawAnalysis.healthBenefits || []).map((benefit: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <p className="text-slate-200">{benefit}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Health Recommendation */}
        {rawAnalysis.healthRecommendation && (
          <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Health Recommendation
            </h3>
            <p className="text-slate-200 leading-relaxed">{rawAnalysis.healthRecommendation}</p>
          </Card>
        )}

        {/* Social Sharing */}
        <SocialShareCard
          foodName={scan.foodName}
          calories={typeof scan.calories === 'string' ? parseInt(scan.calories) : scan.calories}
          protein={typeof scan.protein === 'string' ? parseInt(scan.protein) : scan.protein}
          carbs={typeof scan.carbs === 'string' ? parseInt(scan.carbs) : scan.carbs}
          fats={typeof scan.fats === 'string' ? parseInt(scan.fats) : scan.fats}
          healthScore={typeof scan.healthScore === 'string' ? parseInt(scan.healthScore) : scan.healthScore || 0}
          scanId={scanId}
          imageUrl={scan.imageUrl || undefined}
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (scan.imageUrl) {
                const element = document.createElement("a");
                element.setAttribute("href", scan.imageUrl);
                element.setAttribute("download", `${scan.foodName}.jpg`);
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Image
          </Button>
          <Button
            onClick={() => setLocation("/history")}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Back to History
          </Button>
        </div>
      </div>
    </div>
  );
}
