import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Trash2, Flame, Droplets, Zap, Heart, Shield, Leaf, Utensils } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ScanDetail() {
  const [, params] = useRoute("/scan/:id");
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const scanId = params?.id;

  const { data: scan, isLoading, error } = trpc.food.getScanDetail.useQuery(
    { id: scanId || "" },
    { enabled: !!scanId }
  );

  const deleteMutation = trpc.food.deleteScan.useMutation({
    onSuccess: () => {
      toast.success("Scan deleted successfully");
      navigate("/history");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete scan");
    },
  });

  if (!scanId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-orange-400 hover:bg-orange-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <p className="text-orange-400">Scan not found</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-orange-300">Loading detailed food analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/history")}
            className="mb-6 text-orange-400 hover:bg-orange-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-red-300 mb-2">Error Loading Scan</h2>
                <p className="text-red-200">{error?.message || "The scan could not be found"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const healthScore = Number(scan.healthScore) || 0;
  const confidenceScore = Math.round(Number(scan.confidenceScore) * 100) || 0;
  const totalCalories = Number(scan.calories) || 0;
  const proteinCals = (Number(scan.protein) || 0) * 4;
  const carbsCals = (Number(scan.carbs) || 0) * 4;
  const fatsCals = (Number(scan.fats) || 0) * 9;
  const totalMacroCals = proteinCals + carbsCals + fatsCals;

  const proteinPercent = totalMacroCals > 0 ? (proteinCals / totalMacroCals) * 100 : 0;
  const carbsPercent = totalMacroCals > 0 ? (carbsCals / totalMacroCals) * 100 : 0;
  const fatsPercent = totalMacroCals > 0 ? (fatsCals / totalMacroCals) * 100 : 0;

  // Get confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-400 bg-green-500/10 border-green-500/30";
    if (score >= 60) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  const getHealthColor = (score: number) => {
    if (score >= 7) return "text-green-400 bg-green-500/10 border-green-500/30";
    if (score >= 5) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/history")}
            className="text-orange-400 hover:bg-orange-400/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
            Detailed Food Analysis
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Main Content Grid */}
        <>
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Food Image & Basic Info */}
          <div className="lg:col-span-1">
            {/* Food Image */}
            {scan.imageUrl && (
              <div className="bg-gradient-to-br from-purple-500/20 to-orange-500/20 rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden mb-6 backdrop-blur-sm">
                <img
                  src={scan.imageUrl}
                  alt={scan.foodName}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Food Name & Type */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl shadow-lg border border-purple-500/30 p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-3">{scan.foodName}</h2>
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    scan.isVegan === "true"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : scan.isVegetarian === "true"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                  }`}
                >
                  {scan.isVegan === "true"
                    ? "🌱 Vegan"
                    : scan.isVegetarian === "true"
                      ? "🥬 Vegetarian"
                      : "🍗 Non-Veg"}
                </span>
                {scan.foodType && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {scan.foodType}
                  </span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl shadow-lg border border-purple-500/30 p-4 text-center backdrop-blur-sm mb-6">
              <p className="text-orange-300 text-sm">Scanned on</p>
              <p className="text-white font-semibold">
                {format(new Date(scan.createdAt), "MMM dd, yyyy HH:mm")}
              </p>
            </div>

            {/* AI Confidence Score */}
            {scan.confidenceScore && (
              <div className={`rounded-3xl shadow-lg border-2 p-6 backdrop-blur-sm ${getConfidenceColor(confidenceScore)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">AI Confidence</span>
                </div>
                <p className="text-3xl font-bold mb-2">{confidenceScore}%</p>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 h-full rounded-full"
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-2 opacity-80">
                  {confidenceScore >= 80
                    ? "Highly accurate analysis"
                    : confidenceScore >= 60
                      ? "Moderate confidence - verify details"
                      : "Low confidence - use with caution"}
                </p>
              </div>
            )}
          </div>

          {/* Middle & Right Columns - Nutritional Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calories & Health Score */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Calories */}
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl shadow-lg border border-orange-500/30 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <p className="text-orange-200 font-semibold">Calories</p>
                </div>
                <p className="text-4xl font-bold text-orange-300">{totalCalories}</p>
                <p className="text-orange-200 text-sm mt-1">kcal per serving</p>
              </div>

              {/* Health Score */}
              <div className={`rounded-3xl shadow-lg border-2 p-6 backdrop-blur-sm ${getHealthColor(healthScore)}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6" />
                  <p className="font-semibold">Health Score</p>
                </div>
                <p className="text-4xl font-bold">{healthScore.toFixed(1)}</p>
                <p className="text-sm mt-1">out of 10</p>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl shadow-lg border border-purple-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">Macronutrient Breakdown</h3>

              {/* Macro Bars */}
              <div className="space-y-4 mb-6">
                {/* Protein */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-400" />
                      <span className="text-white font-semibold">Protein</span>
                    </div>
                    <span className="text-white font-bold">{Number(scan.protein) || 0}g</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-full"
                      style={{ width: `${proteinPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-orange-300 mt-1">{proteinPercent.toFixed(0)}% of macros</p>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-semibold">Carbs</span>
                    </div>
                    <span className="text-white font-bold">{Number(scan.carbs) || 0}g</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-full"
                      style={{ width: `${carbsPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-orange-300 mt-1">{carbsPercent.toFixed(0)}% of macros</p>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-semibold">Fats</span>
                    </div>
                    <span className="text-white font-bold">{Number(scan.fats) || 0}g</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-full"
                      style={{ width: `${fatsPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-orange-300 mt-1">{fatsPercent.toFixed(0)}% of macros</p>
                </div>
              </div>

              {/* Additional Nutrients */}
              <div className="grid grid-cols-2 gap-3 bg-slate-800/50 rounded-2xl p-4">
                {scan.fiber && (
                  <div>
                    <p className="text-slate-400 text-xs">Fiber</p>
                    <p className="text-white font-bold">{scan.fiber}g</p>
                  </div>
                )}
                {scan.sugar && (
                  <div>
                    <p className="text-slate-400 text-xs">Sugar</p>
                    <p className="text-white font-bold">{scan.sugar}g</p>
                  </div>
                )}
                {scan.sodium && (
                  <div>
                    <p className="text-slate-400 text-xs">Sodium</p>
                    <p className="text-white font-bold">{scan.sodium}mg</p>
                  </div>
                )}
                {scan.cholesterol && (
                  <div>
                    <p className="text-slate-400 text-xs">Cholesterol</p>
                    <p className="text-white font-bold">{scan.cholesterol}mg</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        </>
        {/* Vitamins & Minerals Section */}
        {((scan.vitamins as any) || (scan.minerals as any)) && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Vitamins */}
            {(scan.vitamins as any) && Array.isArray(scan.vitamins as any) && ((scan.vitamins as any[]) || []).length > 0 && (
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl shadow-lg border border-green-500/30 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Leaf className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Essential Vitamins</h2>
                </div>
                <div className="space-y-3">
                  {(scan.vitamins as any[] || []).map((vitamin: any, idx: number) => (
                    <div key={idx} className="bg-slate-800/50 rounded-2xl p-3 border border-green-500/20">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-green-300 font-semibold text-sm">{String(vitamin.name)}</p>
                        {vitamin.dailyValue && (
                          <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                            {String(vitamin.dailyValue)}
                          </span>
                        )}
                      </div>
                      <p className="text-white font-bold">
                        {String(vitamin.amount)} {String(vitamin.unit || "")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Minerals */}
            {(scan.minerals as any) && Array.isArray(scan.minerals as any) && ((scan.minerals as any[]) || []).length > 0 && (
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl shadow-lg border border-blue-500/30 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Essential Minerals</h2>
                </div>
                <div className="space-y-3">
                  {(scan.minerals as any[] || []).map((mineral: any, idx: number) => (
                    <div key={idx} className="bg-slate-800/50 rounded-2xl p-3 border border-blue-500/20">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-blue-300 font-semibold text-sm">{String(mineral.name)}</p>
                        {mineral.dailyValue && (
                          <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                            {String(mineral.dailyValue)}
                          </span>
                        )}
                      </div>
                      <p className="text-white font-bold">
                        {String(mineral.amount)} {String(mineral.unit || "")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ingredients */}
        {scan.ingredients && Array.isArray(scan.ingredients) && scan.ingredients.length > 0 && (
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl shadow-lg border border-purple-500/30 p-6 backdrop-blur-sm mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Utensils className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-white">Ingredients</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(scan.ingredients as any[] || []).map((ingredient: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-800/50 rounded-2xl p-3 border border-orange-500/20">
                  <span className="text-green-400 font-bold text-lg flex-shrink-0">✓</span>
                  <span className="text-slate-200">{String(ingredient)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allergens */}
        {scan.allergens && Array.isArray(scan.allergens) && scan.allergens.length > 0 && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-3xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-300 mb-4">⚠️ Allergen Warnings</h2>
                <div className="flex flex-wrap gap-2">
                  {(scan.allergens as any[] || []).map((allergen: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-red-500/30 text-red-200 rounded-full text-sm font-bold border border-red-500/50"
                    >
                      {String(allergen)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Benefits */}
        {scan.healthBenefits && Array.isArray(scan.healthBenefits) && (scan.healthBenefits as any[]).length > 0 && (
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl shadow-lg border border-green-500/30 p-6 backdrop-blur-sm mb-8">
            <h2 className="text-xl font-bold text-white mb-4">✨ Health Benefits</h2>
            <ul className="space-y-2">
              {(scan.healthBenefits as any[] || []).map((benefit: any, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-slate-200">
                  <span className="text-green-400 font-bold mt-1">→</span>
                  <span>{String(benefit)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Health Recommendation */}
        {scan.healthRecommendation && (
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl shadow-lg border border-blue-500/30 p-6 backdrop-blur-sm mb-8">
            <h2 className="text-xl font-bold text-white mb-3">💡 Personalized Recommendation</h2>
            <p className="text-slate-200 text-lg leading-relaxed">{scan.healthRecommendation}</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-orange-500/10 border-l-4 border-orange-400 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <p className="text-orange-300 font-semibold mb-2">⚠️ Important Disclaimer</p>
          <p className="text-orange-200 text-sm leading-relaxed">
            ScanEat AI analysis is for informational purposes only. Always verify ingredients if you have allergies or dietary restrictions. 
            This analysis should not replace professional medical or nutritional advice. Consult a healthcare professional for personalized dietary guidance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/history")}
            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-full py-3 text-lg"
          >
            Back to History
          </Button>
          <Button
            variant="outline"
            onClick={() => deleteMutation.mutate({ id: scanId })}
            disabled={deleteMutation.isPending}
            className="flex-1 border-2 border-red-500/50 text-red-300 hover:bg-red-500/10 rounded-full py-3 text-lg"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
