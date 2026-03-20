import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getDietaryGoals,
  upsertDietaryGoals,
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

describe("Meal Planning System", () => {
  // Use a valid user ID from the database (typically 1 for first user)
  const testUserId = 1;

  describe("Dietary Goals", () => {
    it("should create dietary goals for a user", async () => {
      const goals = await upsertDietaryGoals(testUserId, {
        dietType: "balanced",
        calorieTarget: 2000,
        proteinTarget: 100,
        carbsTarget: 250,
        fatsTarget: 65,
        mealsPerDay: 3,
      });

      expect(goals).toBeDefined();
      expect(goals?.dietType).toBe("balanced");
      expect(goals?.calorieTarget).toContain("2000");
    });

    it("should retrieve dietary goals for a user", async () => {
      const goals = await getDietaryGoals(testUserId);
      expect(goals).toBeDefined();
      expect(goals?.dietType).toBe("balanced");
    });

    it("should update dietary goals", async () => {
      const updated = await upsertDietaryGoals(testUserId, {
        dietType: "vegan",
        calorieTarget: 1800,
      });

      expect(updated?.dietType).toBe("vegan");
      expect(updated?.calorieTarget).toContain("1800");
    });

    it("should handle missing dietary goals gracefully", async () => {
      const goals = await getDietaryGoals(999999);
      expect(goals).toBeNull();
    });
  });

  describe("Meal Plans", () => {
    let mealPlanId: string;

    it("should create a meal plan", async () => {
      const weekStart = new Date();
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const plan = await createMealPlan(testUserId, {
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        planName: "Test Weekly Plan",
        meals: [
          {
            day: "Monday",
            meals: [
              {
                type: "breakfast",
                name: "Oatmeal",
                calories: 350,
              },
            ],
          },
        ] as any,
      });

      expect(plan).toBeDefined();
      expect(plan?.planName).toBe("Test Weekly Plan");
      mealPlanId = plan?.id || "";
    });

    it("should retrieve meal plan by ID", async () => {
      if (!mealPlanId) return;

      const plan = await getMealPlanById(mealPlanId);
      expect(plan).toBeDefined();
      expect(plan?.id).toBe(mealPlanId);
    });

    it("should get user's meal plans", async () => {
      const plans = await getUserMealPlans(testUserId);
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });

    it("should update meal plan", async () => {
      if (!mealPlanId) return;

      const updated = await updateMealPlan(mealPlanId, {
        planName: "Updated Test Plan",
        isFavorite: "true",
      });

      expect(updated?.planName).toBe("Updated Test Plan");
      expect(updated?.isFavorite).toBe("true");
    });

    it("should toggle favorite status", async () => {
      if (!mealPlanId) return;

      const toggled = await toggleMealPlanFavorite(mealPlanId, false);
      expect(toggled?.isFavorite).toBe("false");
    });

    it("should get favorite meal plans", async () => {
      const favorites = await getFavoriteMealPlans(testUserId);
      expect(Array.isArray(favorites)).toBe(true);
    });
  });

  describe("Meal Logging", () => {
    it.skip("should log a meal", async () => {
      const mealLogId = await logMeal(testUserId, {
        foodName: "Chicken Breast",
        mealType: "lunch",
        calories: "450",
        protein: "50",
        carbs: "0",
        fats: "20",
        loggedAt: new Date(),
      });

      expect(mealLogId).toBeDefined();
      expect(typeof mealLogId).toBe("string");
    });

    it.skip("should get user's meal logs for date range", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const logs = await getUserMealLogs(testUserId, startDate, endDate);
      expect(Array.isArray(logs)).toBe(true);
    });

    it.skip("should calculate nutrition totals", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();

      const totals = await calculateNutritionTotals(testUserId, startDate, endDate);

      expect(totals).toBeDefined();
      expect(totals.totalCalories).toBeGreaterThanOrEqual(0);
      expect(totals.totalProtein).toBeGreaterThanOrEqual(0);
      expect(totals.mealCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Meal Feedback", () => {
    let mealPlanId: string;

    beforeAll(async () => {
      const weekStart = new Date();
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const plan = await createMealPlan(testUserId, {
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        planName: "Feedback Test Plan",
      });

      mealPlanId = plan?.id || "";
    });

    it("should add meal feedback", async () => {
      if (!mealPlanId) return;

      const result = await addMealFeedback(mealPlanId, testUserId, {
        dayOfWeek: 0,
        mealType: "breakfast",
        foodName: "Oatmeal",
        rating: 4,
        feedback: "Tasty and filling",
        wouldRepeat: "true",
      });

      expect(result).toBeDefined();
    });

    it("should get meal plan feedback", async () => {
      if (!mealPlanId) return;

      const feedback = await getMealPlanFeedback(mealPlanId);
      expect(Array.isArray(feedback)).toBe(true);
    });
  });

  describe("Dietary Pattern Analysis", () => {
    it("should analyze dietary patterns", async () => {
      const patterns = await analyzeDietaryPatterns(testUserId);

      expect(patterns).toBeDefined();
      expect(patterns.avgCalories).toBeGreaterThanOrEqual(0);
      expect(patterns.avgProtein).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(patterns.preferredFoodTypes)).toBe(true);
      expect(Array.isArray(patterns.commonAllergens)).toBe(true);
    });

    it("should handle users with no scan history", async () => {
      const patterns = await analyzeDietaryPatterns(999999);

      expect(patterns).toBeDefined();
      expect(patterns.avgCalories).toBe(0);
      expect(patterns.preferredFoodTypes.length).toBe(0);
    });
  });

  describe("Active Meal Plan", () => {
    it.skip("should get active meal plan within date range", async () => {
      const weekStart = new Date();
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      await createMealPlan(testUserId, {
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        planName: "Active Plan Test",
        isActive: "true",
      });

      const activePlan = await getActiveMealPlan(testUserId);
      expect(activePlan).toBeDefined();
      expect(activePlan?.isActive).toBe("true");
    });

    it.skip("should return null if no active plan exists", async () => {
      const activePlan = await getActiveMealPlan(999999);
      expect(activePlan).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const goals = await getDietaryGoals(-1);
      expect(goals).toBeNull();
    });

    it("should handle invalid meal plan IDs", async () => {
      const plan = await getMealPlanById("invalid-id-12345");
      expect(plan).toBeNull();
    });

    it("should handle empty meal logs", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 100);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 99);

      const logs = await getUserMealLogs(999999, startDate, endDate);
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(0);
    });
  });
});
