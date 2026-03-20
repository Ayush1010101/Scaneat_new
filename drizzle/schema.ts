import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  decimal,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (unique per user, e.g. "google_123456") */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Food scans table
export const scans = mysqlTable(
  "scans",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId").notNull(),
    foodName: varchar("foodName", { length: 255 }).notNull(),
    foodDescription: text("foodDescription"),
    imageUrl: text("imageUrl"),
    calories: decimal("calories", { precision: 10, scale: 2 }).notNull(),
    protein: decimal("protein", { precision: 10, scale: 2 }).notNull(),
    carbs: decimal("carbs", { precision: 10, scale: 2 }).notNull(),
    fats: decimal("fats", { precision: 10, scale: 2 }).notNull(),
    fiber: decimal("fiber", { precision: 10, scale: 2 }),
    sugar: decimal("sugar", { precision: 10, scale: 2 }),
    sodium: decimal("sodium", { precision: 10, scale: 2 }),
    cholesterol: decimal("cholesterol", { precision: 10, scale: 2 }),
    foodType: varchar("foodType", { length: 50 }),
    isVegetarian: mysqlEnum("isVegetarian", ["true", "false"]).default("false"),
    isVegan: mysqlEnum("isVegan", ["true", "false"]).default("false"),
    healthScore: decimal("healthScore", { precision: 3, scale: 1 }),
    portionSize: text("portionSize"),
    servingSize: text("servingSize"),
    ingredients: json("ingredients"),
    allergens: json("allergens"),
    vitamins: json("vitamins"),
    minerals: json("minerals"),
    healthBenefits: json("healthBenefits"),
    healthConcerns: json("healthConcerns"),
    dietaryRestrictions: json("dietaryRestrictions"),
    bestPairingFoods: json("bestPairingFoods"),
    estimatedCookingMethod: varchar("estimatedCookingMethod", { length: 100 }),
    healthRecommendation: text("healthRecommendation"),
    confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.85"),
    rawAnalysis: json("rawAnalysis"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  })
);

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;

// Dietary goals table
export const dietaryGoals = mysqlTable(
  "dietaryGoals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    dietType: mysqlEnum("dietType", [
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
    ]).notNull(),
    calorieTarget: decimal("calorieTarget", { precision: 10, scale: 2 }),
    proteinTarget: decimal("proteinTarget", { precision: 10, scale: 2 }),
    carbsTarget: decimal("carbsTarget", { precision: 10, scale: 2 }),
    fatsTarget: decimal("fatsTarget", { precision: 10, scale: 2 }),
    fiberTarget: decimal("fiberTarget", { precision: 10, scale: 2 }),
    allergies: json("allergies"),
    dislikedFoods: json("dislikedFoods"),
    preferredCuisines: json("preferredCuisines"),
    mealsPerDay: int("mealsPerDay").default(3),
    budget: varchar("budget", { length: 50 }),
    cookingSkillLevel: varchar("cookingSkillLevel", { length: 50 }),
    timeAvailablePerMeal: int("timeAvailablePerMeal"),
    healthConditions: json("healthConditions"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  })
);

export type DietaryGoals = typeof dietaryGoals.$inferSelect;
export type InsertDietaryGoals = typeof dietaryGoals.$inferInsert;

// Meal plans table
export const mealPlans = mysqlTable(
  "mealPlans",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId").notNull(),
    weekStartDate: timestamp("weekStartDate").notNull(),
    weekEndDate: timestamp("weekEndDate").notNull(),
    planName: varchar("planName", { length: 255 }),
    description: text("description"),
    meals: json("meals"),
    totalCalories: decimal("totalCalories", { precision: 10, scale: 2 }),
    avgProtein: decimal("avgProtein", { precision: 10, scale: 2 }),
    avgCarbs: decimal("avgCarbs", { precision: 10, scale: 2 }),
    avgFats: decimal("avgFats", { precision: 10, scale: 2 }),
    nutritionBalance: json("nutritionBalance"),
    estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
    shoppingList: json("shoppingList"),
    isFavorite: mysqlEnum("isFavorite", ["true", "false"]).default("false"),
    isActive: mysqlEnum("isActive", ["true", "false"]).default("true"),
    generatedBy: varchar("generatedBy", { length: 50 }).default("ai"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  })
);

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;

// Meal feedback table
export const mealFeedback = mysqlTable(
  "mealFeedback",
  {
    id: int("id").autoincrement().primaryKey(),
    mealPlanId: varchar("mealPlanId", { length: 64 }).notNull(),
    userId: int("userId").notNull(),
    dayOfWeek: int("dayOfWeek"),
    mealType: varchar("mealType", { length: 50 }),
    foodName: varchar("foodName", { length: 255 }),
    rating: int("rating"),
    feedback: text("feedback"),
    wouldRepeat: mysqlEnum("wouldRepeat", ["true", "false"]),
    actualNutrition: json("actualNutrition"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    mealPlanIdIdx: foreignKey({
      columns: [table.mealPlanId],
      foreignColumns: [mealPlans.id],
    }),
    userIdIdx: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  })
);

export type MealFeedback = typeof mealFeedback.$inferSelect;
export type InsertMealFeedback = typeof mealFeedback.$inferInsert;

// Meal logging table
export const mealLogs = mysqlTable(
  "mealLogs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId").notNull(),
    mealPlanId: varchar("mealPlanId", { length: 64 }),
    scanId: varchar("scanId", { length: 64 }),
    foodName: varchar("foodName", { length: 255 }).notNull(),
    mealType: varchar("mealType", { length: 50 }),
    calories: decimal("calories", { precision: 10, scale: 2 }),
    protein: decimal("protein", { precision: 10, scale: 2 }),
    carbs: decimal("carbs", { precision: 10, scale: 2 }),
    fats: decimal("fats", { precision: 10, scale: 2 }),
    fiber: decimal("fiber", { precision: 10, scale: 2 }),
    loggedAt: timestamp("loggedAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    mealPlanIdIdx: foreignKey({
      columns: [table.mealPlanId],
      foreignColumns: [mealPlans.id],
    }),
  })
);

export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = typeof mealLogs.$inferInsert;
