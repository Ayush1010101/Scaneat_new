import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getDietaryGoals,
  upsertDietaryGoals,
  getUserScanHistory,
  analyzeDietaryPatterns,
  createMealPlan,
  getMealPlanById,
  getUserMealPlans,
  getActiveMealPlan,
  updateMealPlan,
  addMealFeedback,
  getMealPlanFeedback,
  logMeal,
  getUserMealLogs,
  calculateNutritionTotals,
  getFavoriteMealPlans,
  toggleMealPlanFavorite,
} from "../db-meal-planning";
import { invokeLLM } from "../_core/llm";

const DietaryGoalsSchema = z.object({
  dietType: z.enum([
    "balanced",
    "low-carb",
    "keto",
    "vegan",
    "vegetarian",
    "paleo",
    "mediterranean",
    "high-protein",
    "low-fat",
    "gluten-free",
  ]),
  calorieTarget: z.number().optional(),
  proteinTarget: z.number().optional(),
  carbsTarget: z.number().optional(),
  fatsTarget: z.number().optional(),
  fiberTarget: z.number().optional(),
  allergies: z.array(z.string()).optional(),
  dislikedFoods: z.array(z.string()).optional(),
  preferredCuisines: z.array(z.string()).optional(),
  mealsPerDay: z.number().optional(),
  budget: z.enum(["low", "medium", "high"]).optional(),
  cookingSkillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  timeAvailablePerMeal: z.number().optional(),
  healthConditions: z.array(z.string()).optional(),
});

export const mealPlanningRouter = router({
  /**
   * Get or set user's dietary goals
   */
  getDietaryGoals: protectedProcedure.query(async ({ ctx }) => {
    const goals = await getDietaryGoals(ctx.user.id);
    return goals;
  }),

  /**
   * Update user's dietary goals
   */
  setDietaryGoals: protectedProcedure
    .input(DietaryGoalsSchema)
    .mutation(async ({ ctx, input }) => {
      const goals = await upsertDietaryGoals(ctx.user.id, input as any);
      return goals;
    }),

  /**
   * Analyze user's dietary patterns from scan history
   */
  analyzeDietaryPatterns: protectedProcedure.query(async ({ ctx }) => {
    const patterns = await analyzeDietaryPatterns(ctx.user.id);
    return patterns;
  }),

  /**
   * Generate a personalized weekly meal plan
   */
  generateMealPlan: protectedProcedure
    .input(
      z.object({
        dietaryGoalsId: z.number().optional(),
        weekStartDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get user's dietary goals
        const goals = await getDietaryGoals(ctx.user.id);
        if (!goals) {
          throw new Error("Please set your dietary goals first");
        }

        // Analyze dietary patterns
        const patterns = await analyzeDietaryPatterns(ctx.user.id);

        // Generate meal plan with Claude
        const prompt = `You are a professional nutritionist and meal planner. Generate a personalized weekly meal plan based on the following:

Dietary Goals:
- Diet Type: ${goals.dietType}
- Calorie Target: ${goals.calorieTarget || "2000"} calories/day
- Protein Target: ${goals.proteinTarget || "50"}g/day
- Carbs Target: ${goals.carbsTarget || "250"}g/day
- Fats Target: ${goals.fatsTarget || "65"}g/day
- Fiber Target: ${goals.fiberTarget || "25"}g/day
- Meals Per Day: ${goals.mealsPerDay || 3}
- Budget: ${goals.budget || "medium"}
- Cooking Skill: ${goals.cookingSkillLevel || "intermediate"}
- Time Available Per Meal: ${goals.timeAvailablePerMeal || 30} minutes

User's Dietary Patterns (Last 30 days):
- Average Daily Calories: ${patterns.avgCalories}
- Average Protein: ${patterns.avgProtein}g
- Average Carbs: ${patterns.avgCarbs}g
- Average Fats: ${patterns.avgFats}g
- Preferred Food Types: ${patterns.preferredFoodTypes.join(", ")}
- Vegetarian Meals: ${patterns.vegetarianPercentage}%
- Vegan Meals: ${patterns.veganPercentage}%

Restrictions:
- Allergies: ${Array.isArray(goals.allergies) ? (goals.allergies as any[]).join(", ") : "None"}
- Disliked Foods: ${Array.isArray(goals.dislikedFoods) ? (goals.dislikedFoods as any[]).join(", ") : "None"}
- Preferred Cuisines: ${Array.isArray(goals.preferredCuisines) ? (goals.preferredCuisines as any[]).join(", ") : "Any"}
- Health Conditions: ${Array.isArray(goals.healthConditions) ? (goals.healthConditions as any[]).join(", ") : "None"}

Please generate a detailed 7-day meal plan with:
1. Breakfast, lunch, dinner, and snacks for each day
2. Estimated calories and macros for each meal
3. Simple recipes or meal descriptions
4. Shopping list with quantities
5. Estimated total cost
6. Nutritional balance analysis for the week

Format the response as JSON with this structure:
{
  "weekPlan": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "breakfast",
          "name": "Meal name",
          "description": "Brief description",
          "calories": 350,
          "protein": 15,
          "carbs": 45,
          "fats": 12,
          "recipe": "Simple recipe or instructions"
        }
      ],
      "dailyTotals": { "calories": 2000, "protein": 75, "carbs": 250, "fats": 65 }
    }
  ],
  "shoppingList": [
    { "item": "Item name", "quantity": "amount", "unit": "unit", "estimatedCost": 5.99 }
  ],
  "totalEstimatedCost": 75.00,
  "nutritionBalance": {
    "avgCalories": 2000,
    "avgProtein": 75,
    "avgCarbs": 250,
    "avgFats": 65,
    "meetsGoals": true,
    "notes": "Balanced meal plan that meets your nutritional targets"
  }
}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a professional nutritionist and meal planner. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: prompt as any,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "meal_plan",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  weekPlan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "string" },
                        meals: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: { type: "string" },
                              name: { type: "string" },
                              description: { type: "string" },
                              calories: { type: "number" },
                              protein: { type: "number" },
                              carbs: { type: "number" },
                              fats: { type: "number" },
                              recipe: { type: "string" },
                            },
                          },
                        },
                        dailyTotals: {
                          type: "object",
                          properties: {
                            calories: { type: "number" },
                            protein: { type: "number" },
                            carbs: { type: "number" },
                            fats: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                  shoppingList: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        quantity: { type: "string" },
                        unit: { type: "string" },
                        estimatedCost: { type: "number" },
                      },
                    },
                  },
                  totalEstimatedCost: { type: "number" },
                  nutritionBalance: {
                    type: "object",
                    properties: {
                      avgCalories: { type: "number" },
                      avgProtein: { type: "number" },
                      avgCarbs: { type: "number" },
                      avgFats: { type: "number" },
                      meetsGoals: { type: "boolean" },
                      notes: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        });

        // Parse the response
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Failed to generate meal plan");
        }

        const contentStr = typeof content === "string" ? content : JSON.stringify(content);
        const mealPlanData = JSON.parse(contentStr);

        // Save meal plan to database
        const weekStart = input.weekStartDate || new Date();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const savedPlan = await createMealPlan(ctx.user.id, {
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          planName: `Weekly Meal Plan - ${weekStart.toLocaleDateString()}`,
          meals: mealPlanData.weekPlan as any,
          shoppingList: mealPlanData.shoppingList as any,
          estimatedCost: mealPlanData.totalEstimatedCost?.toString() as any,
          nutritionBalance: mealPlanData.nutritionBalance as any,
          totalCalories: (mealPlanData.nutritionBalance.avgCalories * 7)?.toString() as any,
          avgProtein: mealPlanData.nutritionBalance.avgProtein?.toString() as any,
          avgCarbs: mealPlanData.nutritionBalance.avgCarbs?.toString() as any,
          avgFats: mealPlanData.nutritionBalance.avgFats?.toString() as any,
        } as any);

        return savedPlan;
      } catch (error) {
        console.error("[Meal Planning] Generation error:", error);
        throw new Error(
          `Failed to generate meal plan: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Get user's meal plans
   */
  getMealPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await getUserMealPlans(ctx.user.id);
    return plans;
  }),

  /**
   * Get active meal plan
   */
  getActiveMealPlan: protectedProcedure.query(async ({ ctx }) => {
    const plan = await getActiveMealPlan(ctx.user.id);
    return plan;
  }),

  /**
   * Get favorite meal plans
   */
  getFavoriteMealPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await getFavoriteMealPlans(ctx.user.id);
    return plans;
  }),

  /**
   * Toggle meal plan favorite
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ mealPlanId: z.string(), isFavorite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await toggleMealPlanFavorite(input.mealPlanId, input.isFavorite);
      return plan;
    }),

  /**
   * Log a meal
   */
  logMeal: protectedProcedure
    .input(
      z.object({
        foodName: z.string(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fats: z.number().optional(),
        fiber: z.number().optional(),
        mealPlanId: z.string().optional(),
        scanId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mealLogId = await logMeal(ctx.user.id, {
        foodName: input.foodName,
        mealType: input.mealType,
        calories: input.calories?.toString(),
        protein: input.protein?.toString(),
        carbs: input.carbs?.toString(),
        fats: input.fats?.toString(),
        fiber: input.fiber?.toString(),
        mealPlanId: input.mealPlanId,
        scanId: input.scanId,
        loggedAt: new Date(),
      } as any);
      return { id: mealLogId };
    }),

  /**
   * Get nutrition totals for date range
   */
  getNutritionTotals: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const totals = await calculateNutritionTotals(
        ctx.user.id,
        input.startDate,
        input.endDate
      );
      return totals;
    }),

  /**
   * Add feedback for a meal
   */
  addMealFeedback: protectedProcedure
    .input(
      z.object({
        mealPlanId: z.string(),
        dayOfWeek: z.number(),
        mealType: z.string(),
        foodName: z.string(),
        rating: z.number().min(1).max(5),
        feedback: z.string().optional(),
        wouldRepeat: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await addMealFeedback(input.mealPlanId, ctx.user.id, {
        ...input,
        wouldRepeat: input.wouldRepeat ? "true" : "false",
      } as any);
      return { success: true };
    }),

  /**
   * Get feedback for a meal plan
   */
  getMealPlanFeedback: protectedProcedure
    .input(z.object({ mealPlanId: z.string() }))
    .query(async ({ input }) => {
      const feedback = await getMealPlanFeedback(input.mealPlanId);
      return feedback;
    }),
}) as any;
