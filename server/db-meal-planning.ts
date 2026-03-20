import { getDb } from "./db";
import {
  dietaryGoals,
  mealPlans,
  mealFeedback,
  mealLogs,
  scans,
  DietaryGoals,
  MealPlan,
  MealFeedback,
  MealLog,
} from "../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

/**
 * Get or create user's dietary goals
 */
export async function getDietaryGoals(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const goals = await db
    .select()
    .from(dietaryGoals)
    .where(eq(dietaryGoals.userId, userId))
    .limit(1);

  return goals[0] || null;
}

/**
 * Create or update dietary goals
 */
export async function upsertDietaryGoals(userId: number, goals: Partial<DietaryGoals>) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getDietaryGoals(userId);

  if (existing) {
    await db
      .update(dietaryGoals)
      .set({
        ...goals,
        updatedAt: new Date(),
      })
      .where(eq(dietaryGoals.userId, userId));

    return getDietaryGoals(userId);
  }

  const result = await db.insert(dietaryGoals).values({
    userId,
    dietType: goals.dietType || "balanced",
    ...goals,
  } as any);

  return getDietaryGoals(userId);
}

/**
 * Get user's recent scans for pattern analysis
 */
export async function getUserScanHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await db
    .select()
    .from(scans)
    .where(and(eq(scans.userId, userId), gte(scans.createdAt, cutoffDate)))
    .orderBy(desc(scans.createdAt));
}

/**
 * Analyze user's dietary patterns from scan history
 */
export async function analyzeDietaryPatterns(userId: number) {
  const scanHistory = await getUserScanHistory(userId, 30);

  if (scanHistory.length === 0) {
    return {
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFats: 0,
      preferredFoodTypes: [],
      vegetarianPercentage: 0,
      veganPercentage: 0,
      commonAllergens: [],
    };
  }

  const totalScans = scanHistory.length;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let vegetarianCount = 0;
  let veganCount = 0;
  const foodTypes: Record<string, number> = {};
  const allergenCounts: Record<string, number> = {};

  for (const scan of scanHistory) {
    const calories = parseFloat(scan.calories?.toString() || "0");
    const protein = parseFloat(scan.protein?.toString() || "0");
    const carbs = parseFloat(scan.carbs?.toString() || "0");
    const fats = parseFloat(scan.fats?.toString() || "0");

    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFats += fats;

    if (scan.isVegetarian === "true") vegetarianCount++;
    if (scan.isVegan === "true") veganCount++;

    if (scan.foodType) {
      foodTypes[scan.foodType] = (foodTypes[scan.foodType] || 0) + 1;
    }

    if (scan.allergens && Array.isArray(scan.allergens)) {
      for (const allergen of scan.allergens) {
        const allergenName = typeof allergen === "string" ? allergen : allergen.name;
        allergenCounts[allergenName] = (allergenCounts[allergenName] || 0) + 1;
      }
    }
  }

  const preferredFoodTypes = Object.entries(foodTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([type]) => type);

  const commonAllergens = Object.entries(allergenCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([allergen]) => allergen);

  return {
    avgCalories: Math.round(totalCalories / totalScans),
    avgProtein: Math.round((totalProtein / totalScans) * 10) / 10,
    avgCarbs: Math.round((totalCarbs / totalScans) * 10) / 10,
    avgFats: Math.round((totalFats / totalScans) * 10) / 10,
    preferredFoodTypes,
    vegetarianPercentage: Math.round((vegetarianCount / totalScans) * 100),
    veganPercentage: Math.round((veganCount / totalScans) * 100),
    commonAllergens,
  };
}

/**
 * Create a new meal plan
 */
export async function createMealPlan(
  userId: number,
  plan: Partial<MealPlan>
): Promise<MealPlan | null> {
  const db = await getDb();
  if (!db) return null;

  const id = `meal-plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(mealPlans).values({
    id,
    userId,
    weekStartDate: plan.weekStartDate || new Date(),
    weekEndDate: plan.weekEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ...plan,
  } as any);

  return getMealPlanById(id);
}

/**
 * Get meal plan by ID
 */
export async function getMealPlanById(id: string): Promise<MealPlan | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(mealPlans).where(eq(mealPlans.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Get user's meal plans
 */
export async function getUserMealPlans(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.userId, userId))
    .orderBy(desc(mealPlans.createdAt))
    .limit(limit);
}

/**
 * Get active meal plan for user
 */
export async function getActiveMealPlan(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();

  const result = await db
    .select()
    .from(mealPlans)
    .where(
      and(
        eq(mealPlans.userId, userId),
        eq(mealPlans.isActive, "true"),
        lte(mealPlans.weekStartDate, now),
        gte(mealPlans.weekEndDate, now)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Update meal plan
 */
export async function updateMealPlan(id: string, updates: Partial<MealPlan>) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(mealPlans)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(mealPlans.id, id));

  return getMealPlanById(id);
}

/**
 * Add meal feedback
 */
export async function addMealFeedback(
  mealPlanId: string,
  userId: number,
  feedback: Partial<MealFeedback>
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(mealFeedback).values({
    mealPlanId,
    userId,
    ...feedback,
  } as any);

  return result;
}

/**
 * Get meal feedback for a plan
 */
export async function getMealPlanFeedback(mealPlanId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mealFeedback)
    .where(eq(mealFeedback.mealPlanId, mealPlanId))
    .orderBy(mealFeedback.dayOfWeek);
}

/**
 * Log a meal
 */
export async function logMeal(userId: number, meal: Partial<MealLog>) {
  const db = await getDb();
  if (!db) return null;

  const id = `meal-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(mealLogs).values({
    id,
    userId,
    loggedAt: new Date(),
    ...meal,
  } as any);

  return id;
}

/**
 * Get user's meal logs for a date range
 */
export async function getUserMealLogs(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, startDate),
        lte(mealLogs.loggedAt, endDate)
      )
    )
    .orderBy(desc(mealLogs.loggedAt));
}

/**
 * Calculate nutrition totals from meal logs
 */
export async function calculateNutritionTotals(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const logs = await getUserMealLogs(userId, startDate, endDate);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalFiber = 0;

  for (const log of logs) {
    totalCalories += parseFloat(log.calories?.toString() || "0");
    totalProtein += parseFloat(log.protein?.toString() || "0");
    totalCarbs += parseFloat(log.carbs?.toString() || "0");
    totalFats += parseFloat(log.fats?.toString() || "0");
    totalFiber += parseFloat(log.fiber?.toString() || "0");
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFats: Math.round(totalFats * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    mealCount: logs.length,
  };
}

/**
 * Get favorite meal plans
 */
export async function getFavoriteMealPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mealPlans)
    .where(and(eq(mealPlans.userId, userId), eq(mealPlans.isFavorite, "true")))
    .orderBy(desc(mealPlans.createdAt));
}

/**
 * Toggle meal plan favorite status
 */
export async function toggleMealPlanFavorite(id: string, isFavorite: boolean) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(mealPlans)
    .set({
      isFavorite: isFavorite ? "true" : "false",
      updatedAt: new Date(),
    })
    .where(eq(mealPlans.id, id));

  return getMealPlanById(id);
}
