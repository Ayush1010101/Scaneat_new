import { z } from "zod";
import { createHash } from "crypto";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { createScan, getScanById, getUserScans, deleteScan } from "../db";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { randomUUID as nanoid } from "crypto";

// Simple in-memory cache for food analysis (TTL: 1 hour)
const analysisCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper to convert base64 to buffer
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

// Helper to detect actual image MIME type from base64 magic bytes
function detectMimeType(base64Data: string): string {
  // Check first few bytes of the base64 data for magic numbers
  const raw = base64Data.substring(0, 16);
  if (raw.startsWith("/9j/")) return "image/jpeg";
  if (raw.startsWith("iVBOR")) return "image/png";
  if (raw.startsWith("UklGR")) return "image/webp";
  if (raw.startsWith("R0lGO")) return "image/gif";
  return "image/jpeg"; // default fallback
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
    // Step 1: Strip markdown code fences if present (```json ... ```)
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

    // Step 2: Try direct parse first (works when response_format is json_object)
    try {
      return JSON.parse(cleaned);
    } catch {
      // Fall through to regex extraction
    }

    // Step 3: Extract JSON object from surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return null;
  }
}

// Retry logic with exponential backoff and rate-limit awareness
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
      const errMsg = (error as Error).message || "";

      // For 429 rate limit errors, extract retry delay from error message
      if (errMsg.includes("429") && attempt < maxRetries - 1) {
        const retryMatch = errMsg.match(/retry in ([\d.]+)s/i);
        const retryDelaySec = retryMatch ? parseFloat(retryMatch[1]) : 40;
        const delayMs = Math.min(retryDelaySec * 1000, 45000);
        console.log(
          `[Retry] Rate limited (429), waiting ${delayMs / 1000}s before retry ${attempt + 2}...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

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
          // Detect actual image MIME type from the base64 data
          const mimeType = detectMimeType(input.imageData);
          console.log(`[Food Analysis] Detected image MIME type: ${mimeType}`);

          const response = await retryWithBackoff(
            async () => {
              return await invokeLLM({
                responseFormat: { type: "json_object" },
                messages: [
                  {
                    role: "system",
                    content: `You are an expert nutritionist and food scientist. Analyze the food in the image with high precision.

You MUST respond with a valid JSON object. No markdown, no explanations.

PRIORITY 1 — Identify the food correctly. Look carefully at colors, textures, shape, plating, and cooking method. If you recognize the dish, name it specifically (e.g., "Chicken Tikka Masala" not "curry").

PRIORITY 2 — Estimate accurate nutritional values per visible serving. Cross-reference with USDA FoodData Central values. For Indian, Asian, or regional dishes, use culturally accurate nutritional databases.

PRIORITY 3 — Provide complete micronutrient and health data.

Return this exact JSON structure:
{
  "foodName": "specific dish name",
  "foodDescription": "description of the dish, ingredients visible, cooking method",
  "foodType": "veg" | "non-veg" | "vegan",
  "isVegetarian": boolean,
  "isVegan": boolean,
  "servingSize": "estimated serving (e.g. '1 plate ~250g')",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "cholesterol": number,
  "healthScore": number (0-10),
  "ingredients": ["ingredient1", "ingredient2"],
  "allergens": [{"name": "allergen", "severity": "critical|moderate|mild"}],
  "vitamins": [{"name": "Vitamin X", "amount": "value", "unit": "mg|mcg|IU", "dailyValue": "X%"}],
  "minerals": [{"name": "Mineral X", "amount": "value", "unit": "mg|mcg", "dailyValue": "X%"}],
  "healthBenefits": ["benefit1", "benefit2", "benefit3"],
  "healthConcerns": [{"concern": "text", "severity": "high|medium|low", "recommendation": "text"}],
  "dietaryRestrictions": ["keto-friendly", "gluten-free", etc],
  "healthRecommendation": "actionable recommendation",
  "bestPairingFoods": ["food1 with reason", "food2 with reason"],
  "estimatedCookingMethod": "grilled|fried|baked|steamed|raw|etc"
}

All number fields must be numeric (not strings). Be precise — do not guess wildly. If uncertain, provide your best estimate based on visual evidence.`
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "image_url",
                        image_url: {
                          url: `data:${mimeType};base64,${input.imageData}`,
                          detail: "high",
                        },
                      },
                      {
                        type: "text",
                        text: "Identify this food and provide detailed, accurate nutritional analysis. Respond with JSON only.",
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
          const errMsg = (llmError as Error).message || "";
          console.error("[LLM Error] Food analysis failed:", llmError);

          // Don't silently return fake data — tell the user what happened
          if (errMsg.includes("429")) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS" as any,
              message: "AI analysis quota exceeded. Please wait a minute and try again, or upgrade your Gemini API plan.",
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI analysis failed. Please try again in a moment.",
          });
        }

        if (!analysis) {
          console.warn("[Food Analysis] Parse failed, using fallback analysis");
          analysis = getFallbackAnalysis();
        }
        
        // Calculate confidence score
        const confidenceScore = calculateConfidenceScore(analysis);
        analysis.confidenceScore = confidenceScore;
        console.log(`[Food Analysis] Confidence: ${confidenceScore}% for ${analysis.foodName}`);

        // Cache the analysis
        saveToCache(cacheKey, analysis);
        console.log(`[Food Analysis] Cached for future use`);

        // Save to database — persist ALL analysis fields
        const scan = await createScan(ctx.user.id, {
          foodName: analysis.foodName,
          foodDescription: analysis.foodDescription,
          imageUrl,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fats: analysis.fats,
          fiber: analysis.fiber,
          sugar: analysis.sugar,
          sodium: analysis.sodium,
          cholesterol: analysis.cholesterol,
          foodType: analysis.foodType,
          isVegetarian: analysis.isVegetarian ? "true" : "false",
          isVegan: analysis.isVegan ? "true" : "false",
          healthScore: analysis.healthScore,
          confidenceScore: (confidenceScore / 100).toString(),
          portionSize: analysis.servingSize || analysis.portionSize,
          servingSize: analysis.servingSize,
          ingredients: analysis.ingredients,
          allergens: analysis.allergens,
          vitamins: analysis.vitamins,
          minerals: analysis.minerals,
          healthBenefits: analysis.healthBenefits,
          healthConcerns: analysis.healthConcerns,
          dietaryRestrictions: analysis.dietaryRestrictions,
          bestPairingFoods: analysis.bestPairingFoods,
          estimatedCookingMethod: analysis.estimatedCookingMethod,
          healthRecommendation: analysis.healthRecommendation,
          rawAnalysis: analysis,
        });

        return scan;
      } catch (error) {
        import("fs").then(fs => fs.writeFileSync("food-err.txt", String((error as any).stack || error)));
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
      import("fs").then(fs => fs.writeFileSync("history-err.txt", String((error as any).stack || error)));
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
