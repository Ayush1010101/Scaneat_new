import { z } from "zod";
import { createHash } from "crypto";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { createScan, getScanById, getUserScans, deleteScan } from "../db";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

// Simple in-memory cache for food analysis (TTL: 1 hour)
const analysisCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper to convert base64 to buffer
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

// Helper to generate cache key from image data
function getCacheKey(imageData: string): string {
  const hash = createHash("md5")
    .update(imageData)
    .digest("hex");
  return `food-analysis-${hash}`;
}

// Helper to get from cache
function getFromCache(key: string): any | null {
  const cached = analysisCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("[Cache] Hit for key:", key);
    return cached.data;
  }
  if (cached) {
    analysisCache.delete(key);
  }
  return null;
}

// Helper to save to cache
function saveToCache(key: string, data: any): void {
  analysisCache.set(key, { data, timestamp: Date.now() });
  console.log("[Cache] Saved key:", key);
}

// Helper to calculate confidence score based on analysis quality
function calculateConfidenceScore(analysis: any): number {
  let confidence = 100;
  
  // Critical fields
  if (!analysis.foodName || analysis.foodName.includes("Unable")) confidence -= 20;
  if (!analysis.calories || analysis.calories === 0) confidence -= 15;
  if (!analysis.servingSize && !analysis.portionSize) confidence -= 10;
  
  // Nutritional completeness
  if (!analysis.protein || analysis.protein === 0) confidence -= 8;
  if (!analysis.carbs || analysis.carbs === 0) confidence -= 8;
  if (!analysis.fats || analysis.fats === 0) confidence -= 8;
  if (analysis.fiber === undefined || analysis.fiber === 0) confidence -= 5;
  if (analysis.sugar === undefined) confidence -= 3;
  
  // Detailed nutrients
  if (!analysis.vitamins || analysis.vitamins.length < 3) confidence -= 10;
  if (!analysis.minerals || analysis.minerals.length < 3) confidence -= 10;
  if (!analysis.ingredients || analysis.ingredients.length === 0) confidence -= 10;
  if (!analysis.allergens) confidence -= 5;
  if (!analysis.healthBenefits || analysis.healthBenefits.length === 0) confidence -= 5;
  if (!analysis.healthRecommendation) confidence -= 5;
  
  // Health score validity
  if (analysis.healthScore === undefined || analysis.healthScore === 0) confidence -= 10;
  
  return Math.max(0, Math.min(100, confidence));
}

// Helper to parse AI response with better error handling
function parseAIResponse(content: string) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return null;
  }
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(
          `[Retry] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

// Fallback food analysis when LLM fails
function getFallbackAnalysis(foodName: string = "Unknown Food") {
  return {
    foodName: foodName || "Unknown Food",
    foodDescription: "Unable to analyze - please try again with a clearer image",
    foodType: "non-veg",
    isVegetarian: false,
    isVegan: false,
    servingSize: "1 serving (estimated)",
    calories: 300,
    protein: 15,
    carbs: 40,
    fats: 10,
    fiber: 3,
    sugar: 5,
    sodium: 500,
    cholesterol: 50,
    healthScore: 5,
    ingredients: ["Unable to determine - please check manually"],
    allergens: ["Unable to determine - please check manually"],
    vitamins: [
      { name: "Vitamin A", amount: "Unknown", unit: "IU", dailyValue: "0%" },
      { name: "Vitamin C", amount: "Unknown", unit: "mg", dailyValue: "0%" },
      { name: "Vitamin D", amount: "Unknown", unit: "IU", dailyValue: "0%" },
      { name: "Vitamin B12", amount: "Unknown", unit: "mcg", dailyValue: "0%" },
    ],
    minerals: [
      { name: "Iron", amount: "Unknown", unit: "mg", dailyValue: "0%" },
      { name: "Calcium", amount: "Unknown", unit: "mg", dailyValue: "0%" },
      { name: "Potassium", amount: "Unknown", unit: "mg", dailyValue: "0%" },
      { name: "Magnesium", amount: "Unknown", unit: "mg", dailyValue: "0%" },
    ],
    healthBenefits: ["Unable to determine"],
    healthConcerns: [],
    dietaryRestrictions: [],
    healthRecommendation: "Unable to provide recommendation. Please verify nutritional information manually.",
    bestPairingFoods: [],
    estimatedCookingMethod: "Unknown",
  };
}

export const foodRouter = router({
  analyzeFood: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 image
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cacheKey = getCacheKey(input.imageData);

      try {
        // Check cache first
        const cachedAnalysis = getFromCache(cacheKey);
        if (cachedAnalysis) {
          // Return cached result with new scan record
          const confidenceScore = calculateConfidenceScore(cachedAnalysis);
          const scan = await createScan(ctx.user.id, {
            foodName: cachedAnalysis.foodName,
            foodDescription: cachedAnalysis.foodDescription,
            calories: cachedAnalysis.calories,
            protein: cachedAnalysis.protein,
            carbs: cachedAnalysis.carbs,
            fats: cachedAnalysis.fats,
            fiber: cachedAnalysis.fiber,
            sugar: cachedAnalysis.sugar,
            sodium: cachedAnalysis.sodium,
            cholesterol: cachedAnalysis.cholesterol,
            foodType: cachedAnalysis.foodType,
            isVegetarian: cachedAnalysis.isVegetarian ? "true" : "false",
            isVegan: cachedAnalysis.isVegan ? "true" : "false",
            healthScore: cachedAnalysis.healthScore,
            confidenceScore: (confidenceScore / 100).toString(),
            portionSize: cachedAnalysis.portionSize,
            servingSize: cachedAnalysis.servingSize,
            ingredients: cachedAnalysis.ingredients,
            allergens: cachedAnalysis.allergens,
            vitamins: cachedAnalysis.vitamins,
            minerals: cachedAnalysis.minerals,
            healthBenefits: cachedAnalysis.healthBenefits,
            healthConcerns: cachedAnalysis.healthConcerns,
            dietaryRestrictions: cachedAnalysis.dietaryRestrictions,
            bestPairingFoods: cachedAnalysis.bestPairingFoods,
            estimatedCookingMethod: cachedAnalysis.estimatedCookingMethod,
            healthRecommendation: cachedAnalysis.healthRecommendation,
            rawAnalysis: cachedAnalysis,
          });
          return scan;
        }

        // Upload image to S3
        const imageBuffer = base64ToBuffer(input.imageData);
        const fileName = `${ctx.user.id}-${nanoid()}.jpg`;
        const { url: imageUrl } = await storagePut(
          `scans/${fileName}`,
          imageBuffer,
          "image/jpeg"
        );
        console.log(`[Food Analysis] Image uploaded to S3`);

        // Call LLM with retry logic
        let analysis: any = null;

        try {
          const response = await retryWithBackoff(
            async () => {
              return await invokeLLM({
                messages: [
                  {
                    role: "system",
                    content: `You are an expert nutritionist, food scientist, and health coach. Analyze the food image with EXTREME precision and provide COMPREHENSIVE nutritional information for health-conscious users.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, no extra text.

Provide DETAILED analysis with these exact fields:
{
  "foodName": "specific food name (e.g., 'Grilled Chicken Breast with Lemon Sauce')",
  "foodDescription": "detailed description of the food, cooking method, and presentation",
  "foodType": "veg/non-veg/vegan",
  "isVegetarian": boolean,
  "isVegan": boolean,
  "servingSize": "exact serving size (e.g., '100g', '1 medium piece', '1 cup')",
  "calories": number (per serving, be VERY accurate),
  "caloriesBreakdown": {"fromProtein": number, "fromCarbs": number, "fromFats": number},
  "protein": number (in grams),
  "proteinQuality": "complete/incomplete",
  "aminoAcids": [{"name": "Leucine", "amount": "value", "unit": "g"}, ...],
  "carbs": number (in grams),
  "carbsBreakdown": {"simple": number, "complex": number, "fiber": number},
  "glycemicIndex": number (0-100),
  "glycemicLoad": number,
  "fats": number (in grams),
  "fatsBreakdown": {"saturated": number, "unsaturated": number, "trans": number},
  "omega3": number (in mg),
  "omega6": number (in mg),
  "fiber": number (in grams),
  "sugar": number (in grams),
  "sugarType": "natural/added/mixed",
  "sodium": number (in mg),
  "cholesterol": number (in mg),
  "healthScore": number (0-10, based on nutritional balance),
  "macroRatio": "P:C:F ratio (e.g., 30:40:30)",
  "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity"],
  "allergens": [{"name": "allergen1", "severity": "critical/moderate/mild"}, ...],
  "vitamins": [
    {"name": "Vitamin A", "amount": "value", "unit": "IU/mcg", "dailyValue": "% DV", "benefits": "supports vision and immunity", "deficiencyRisk": "low/medium/high"},
    {"name": "Vitamin C", "amount": "value", "unit": "mg", "dailyValue": "% DV", "benefits": "antioxidant, immune support", "deficiencyRisk": "low/medium/high"},
    {"name": "Vitamin D", "amount": "value", "unit": "IU/mcg", "dailyValue": "% DV", "benefits": "bone health, calcium absorption", "deficiencyRisk": "low/medium/high"},
    {"name": "Vitamin B12", "amount": "value", "unit": "mcg", "dailyValue": "% DV", "benefits": "energy, nervous system", "deficiencyRisk": "low/medium/high"},
    {"name": "Vitamin B6", "amount": "value", "unit": "mg", "dailyValue": "% DV", "benefits": "brain development, immune function", "deficiencyRisk": "low/medium/high"},
    {"name": "Folate", "amount": "value", "unit": "mcg", "dailyValue": "% DV", "benefits": "cell division, DNA synthesis", "deficiencyRisk": "low/medium/high"}
  ],
  "minerals": [
    {"name": "Iron", "amount": "value", "unit": "mg", "dailyValue": "% DV", "bioavailability": "high/medium/low", "benefits": "oxygen transport", "deficiencyRisk": "low/medium/high"},
    {"name": "Calcium", "amount": "value", "unit": "mg", "dailyValue": "% DV", "bioavailability": "high/medium/low", "benefits": "bone health, muscle function", "deficiencyRisk": "low/medium/high"},
    {"name": "Potassium", "amount": "value", "unit": "mg", "dailyValue": "% DV", "bioavailability": "high/medium/low", "benefits": "heart health, blood pressure", "deficiencyRisk": "low/medium/high"},
    {"name": "Magnesium", "amount": "value", "unit": "mg", "dailyValue": "% DV", "bioavailability": "high/medium/low", "benefits": "muscle relaxation, energy", "deficiencyRisk": "low/medium/high"},
    {"name": "Zinc", "amount": "value", "unit": "mg", "dailyValue": "% DV", "bioavailability": "high/medium/low", "benefits": "immunity, wound healing", "deficiencyRisk": "low/medium/high"}
  ],
  "phytonutrients": [{"name": "Lycopene", "amount": "value", "benefits": "antioxidant, heart health"}, ...],
  "healthBenefits": ["benefit1 with explanation", "benefit2 with explanation", "benefit3 with explanation"],
  "healthConcerns": [{"concern": "concern1", "severity": "high/medium/low", "recommendation": "action to take"}, ...],
  "dietaryRestrictions": ["keto-friendly", "gluten-free", "paleo", "low-sodium", etc],
  "healthRecommendation": "specific, actionable recommendation based on nutritional profile with daily intake guidance",
  "bestPairingFoods": ["food1 for balanced meal with reason", "food2 with reason"],
  "estimatedCookingMethod": "method used (grilled, fried, baked, etc)",
  "nutritionEducation": "brief explanation of key nutrients in this food for user understanding",
  "hydrationTip": "water intake recommendation when consuming this food",
  "timingRecommendation": "best time to eat this food (pre-workout, post-workout, with meals, etc)"
}

Be EXTREMELY accurate with nutritional values. Use standard USDA data where applicable. Provide health education that helps users understand nutrition better. Focus on actionable insights for health-conscious individuals.`
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "image_url",
                        image_url: {
                          url: imageUrl,
                          detail: "high", // Use high detail for accurate analysis
                        },
                      },
                      {
                        type: "text",
                        text: "Analyze this food image in detail. Provide comprehensive nutritional information, vitamins, minerals, health benefits, and recommendations. Return ONLY valid JSON.",
                      },
                    ],
                  },
                ],
              });
            },
            2, // Max 2 retries
            500 // Start with 500ms delay
          );

          // Parse the response
          const analysisContent = response.choices[0]?.message?.content;
          let analysisText = "";

          if (typeof analysisContent === "string") {
            analysisText = analysisContent;
          } else if (Array.isArray(analysisContent)) {
            analysisText = analysisContent
              .filter((item: any) => item.type === "text")
              .map((item: any) => item.text)
              .join("");
          }

          analysis = parseAIResponse(analysisText);
          if (analysis) {
            console.log(`[Food Analysis] Successfully analyzed: ${analysis.foodName}`);
          }
        } catch (llmError) {
          console.error("[LLM Error] Food analysis failed:", llmError);
          analysis = getFallbackAnalysis();
        }

        if (!analysis) {
          console.warn("[Food Analysis] Using fallback analysis");
          analysis = getFallbackAnalysis();
        }
        
        // Calculate confidence score
        const confidenceScore = calculateConfidenceScore(analysis);
        analysis.confidenceScore = confidenceScore;
        console.log(`[Food Analysis] Confidence: ${confidenceScore}% for ${analysis.foodName}`);

        // Cache the analysis
        saveToCache(cacheKey, analysis);
        console.log(`[Food Analysis] Cached for future use`);

        // Save to database
        const scan = await createScan(ctx.user.id, {
          foodName: analysis.foodName,
          imageUrl,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fats: analysis.fats,
          foodType: analysis.foodType,
          isVegetarian: analysis.isVegetarian ? "true" : "false",
          isVegan: analysis.isVegan ? "true" : "false",
          healthScore: analysis.healthScore,
          confidenceScore: (confidenceScore / 100).toString(),
          portionSize: analysis.servingSize || analysis.portionSize,
          ingredients: analysis.ingredients,
          allergens: analysis.allergens,
          vitamins: analysis.vitamins,
          healthRecommendation: analysis.healthRecommendation,
          rawAnalysis: analysis,
        });

        return scan;
      } catch (error) {
        console.error("[Food Analysis] Critical error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Food analysis failed. Please try again with a clearer image.",
        });
      }
    }),

  getScanHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const scans = await getUserScans(ctx.user.id);
      return scans;
    } catch (error) {
      console.error("Error fetching scan history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch scan history",
      });
    }
  }),

  getScanDetail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const scan = await getScanById(input.id, ctx.user.id);
        if (!scan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Scan not found",
          });
        }
        return scan;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching scan detail:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch scan details",
        });
      }
    }),

  deleteScan: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await deleteScan(input.id, ctx.user.id);
        return { success: true };
      } catch (error) {
        console.error("Error deleting scan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete scan",
        });
      }
    }),
});
