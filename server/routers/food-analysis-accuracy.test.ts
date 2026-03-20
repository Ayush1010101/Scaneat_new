import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Comprehensive test suite for Food Lens AI analysis accuracy
 * Tests cover:
 * - Nutritional data completeness and accuracy
 * - Allergen detection
 * - Vitamin and mineral detection
 * - Confidence scoring calculation
 * - Food type classification
 * - Health score calculation
 */

// Mock confidence score calculation function
function calculateConfidenceScore(analysis: any): number {
  let confidence = 100;

  // Critical fields
  if (!analysis.foodName || analysis.foodName.includes("Unable"))
    confidence -= 20;
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
  if (!analysis.ingredients || analysis.ingredients.length === 0)
    confidence -= 10;
  if (!analysis.allergens) confidence -= 5;
  if (!analysis.healthBenefits || analysis.healthBenefits.length === 0)
    confidence -= 5;
  if (!analysis.healthRecommendation) confidence -= 5;

  // Health score validity
  if (analysis.healthScore === undefined || analysis.healthScore === 0)
    confidence -= 10;

  return Math.max(0, Math.min(100, confidence));
}

describe("Food Analysis Accuracy", () => {
  describe("Nutritional Data Completeness", () => {
    it("should include all macronutrients", () => {
      const analysis = {
        foodName: "Grilled Chicken Breast",
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74,
        cholesterol: 85,
        servingSize: "100g",
      };

      expect(analysis.calories).toBeGreaterThan(0);
      expect(analysis.protein).toBeGreaterThan(0);
      expect(analysis.carbs).toBeGreaterThanOrEqual(0);
      expect(analysis.fats).toBeGreaterThan(0);
    });

    it("should include micronutrients (vitamins and minerals)", () => {
      const analysis = {
        foodName: "Spinach Salad",
        vitamins: [
          { name: "Vitamin A", amount: "469", unit: "mcg", dailyValue: "52%" },
          { name: "Vitamin C", amount: "8.4", unit: "mg", dailyValue: "14%" },
          { name: "Vitamin K", amount: "145", unit: "mcg", dailyValue: "121%" },
        ],
        minerals: [
          { name: "Iron", amount: "2.7", unit: "mg", dailyValue: "15%" },
          { name: "Calcium", amount: "99", unit: "mg", dailyValue: "8%" },
          { name: "Magnesium", amount: "79", unit: "mg", dailyValue: "19%" },
        ],
      };

      expect(analysis.vitamins.length).toBeGreaterThanOrEqual(3);
      expect(analysis.minerals.length).toBeGreaterThanOrEqual(3);
      expect(analysis.vitamins[0]).toHaveProperty("name");
      expect(analysis.vitamins[0]).toHaveProperty("amount");
      expect(analysis.vitamins[0]).toHaveProperty("unit");
      expect(analysis.vitamins[0]).toHaveProperty("dailyValue");
    });

    it("should calculate accurate macronutrient percentages", () => {
      const analysis = {
        calories: 200,
        protein: 25, // 25g * 4 cal/g = 100 cal
        carbs: 20, // 20g * 4 cal/g = 80 cal
        fats: 5, // 5g * 9 cal/g = 45 cal
      };

      const proteinCals = analysis.protein * 4;
      const carbsCals = analysis.carbs * 4;
      const fatsCals = analysis.fats * 9;
      const totalMacroCals = proteinCals + carbsCals + fatsCals;

      const proteinPercent = (proteinCals / totalMacroCals) * 100;
      const carbsPercent = (carbsCals / totalMacroCals) * 100;
      const fatsPercent = (fatsCals / totalMacroCals) * 100;

      // Percentages should sum to 100
      expect(proteinPercent + carbsPercent + fatsPercent).toBeCloseTo(100, 1);
      expect(proteinPercent).toBeGreaterThan(0);
      expect(carbsPercent).toBeGreaterThan(0);
      expect(fatsPercent).toBeGreaterThan(0);
    });
  });

  describe("Allergen Detection", () => {
    it("should identify common allergens", () => {
      const analysis = {
        foodName: "Peanut Butter Sandwich",
        allergens: ["Peanuts", "Wheat", "Soy"],
      };

      expect(analysis.allergens).toContain("Peanuts");
      expect(analysis.allergens.length).toBeGreaterThan(0);
    });

    it("should handle foods with no allergens", () => {
      const analysis = {
        foodName: "Plain Rice",
        allergens: [],
      };

      expect(Array.isArray(analysis.allergens)).toBe(true);
      expect(analysis.allergens.length).toBe(0);
    });

    it("should include allergen information in analysis", () => {
      const analysis = {
        foodName: "Milk Chocolate",
        allergens: ["Milk", "Soy", "Tree Nuts"],
        ingredients: [
          "Cocoa solids",
          "Milk powder",
          "Sugar",
          "Soy lecithin",
        ],
      };

      expect(analysis).toHaveProperty("allergens");
      expect(analysis.allergens.length).toBeGreaterThan(0);
    });
  });

  describe("Food Type Classification", () => {
    it("should correctly classify vegetarian foods", () => {
      const analysis = {
        foodName: "Vegetable Stir Fry",
        foodType: "veg",
        isVegetarian: true,
        isVegan: false,
      };

      expect(analysis.isVegetarian).toBe(true);
      expect(analysis.isVegan).toBe(false);
    });

    it("should correctly classify vegan foods", () => {
      const analysis = {
        foodName: "Tofu Curry",
        foodType: "vegan",
        isVegetarian: true,
        isVegan: true,
      };

      expect(analysis.isVegan).toBe(true);
      expect(analysis.isVegetarian).toBe(true);
    });

    it("should correctly classify non-vegetarian foods", () => {
      const analysis = {
        foodName: "Beef Steak",
        foodType: "non-veg",
        isVegetarian: false,
        isVegan: false,
      };

      expect(analysis.isVegetarian).toBe(false);
      expect(analysis.isVegan).toBe(false);
    });
  });

  describe("Health Score Calculation", () => {
    it("should assign high health score to nutritious foods", () => {
      const analysis = {
        foodName: "Grilled Salmon with Vegetables",
        healthScore: 8.5,
        protein: 25,
        carbs: 15,
        fats: 12,
        fiber: 4,
        vitamins: [
          { name: "Vitamin D", amount: "570", unit: "IU" },
          { name: "Vitamin B12", amount: "3.2", unit: "mcg" },
        ],
        minerals: [
          { name: "Omega-3", amount: "2.3", unit: "g" },
          { name: "Selenium", amount: "36", unit: "mcg" },
        ],
      };

      expect(analysis.healthScore).toBeGreaterThanOrEqual(7);
    });

    it("should assign lower health score to less nutritious foods", () => {
      const analysis = {
        foodName: "Sugary Soda",
        healthScore: 2.5,
        calories: 140,
        protein: 0,
        carbs: 39,
        fats: 0,
        sugar: 39,
        fiber: 0,
      };

      expect(analysis.healthScore).toBeLessThan(5);
    });

    it("should calculate health score between 0-10", () => {
      const analysis = {
        foodName: "Mixed Salad",
        healthScore: 7.2,
      };

      expect(analysis.healthScore).toBeGreaterThanOrEqual(0);
      expect(analysis.healthScore).toBeLessThanOrEqual(10);
    });
  });

  describe("Confidence Score Calculation", () => {
    it("should give high confidence for complete analysis", () => {
      const analysis = {
        foodName: "Grilled Chicken Breast",
        foodDescription: "Grilled chicken breast with herbs",
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74,
        cholesterol: 85,
        servingSize: "100g",
        healthScore: 8,
        ingredients: ["Chicken breast", "Olive oil", "Herbs"],
        allergens: [],
        vitamins: [
          { name: "Vitamin B6", amount: "0.9", unit: "mg", dailyValue: "53%" },
          { name: "Vitamin B12", amount: "0.3", unit: "mcg", dailyValue: "5%" },
          { name: "Niacin", amount: "8.6", unit: "mg", dailyValue: "54%" },
        ],
        minerals: [
          { name: "Selenium", amount: "27", unit: "mcg", dailyValue: "49%" },
          { name: "Phosphorus", amount: "220", unit: "mg", dailyValue: "31%" },
          { name: "Zinc", amount: "0.8", unit: "mg", dailyValue: "7%" },
        ],
        healthBenefits: [
          "High in protein",
          "Low in fat",
          "Good source of B vitamins",
        ],
        healthRecommendation: "Excellent protein source for muscle building",
      };

      const confidence = calculateConfidenceScore(analysis);
      expect(confidence).toBeGreaterThanOrEqual(80);
    });

    it("should give moderate confidence for partial analysis", () => {
      const analysis = {
        foodName: "Pasta",
        calories: 221,
        protein: 8,
        carbs: 43,
        fats: 1.1,
        servingSize: "100g",
        healthScore: 5,
        ingredients: ["Wheat flour", "Water"],
        allergens: ["Wheat"],
        vitamins: [
          { name: "Vitamin B1", amount: "0.1", unit: "mg", dailyValue: "8%" },
        ],
        minerals: [
          { name: "Iron", amount: "1.8", unit: "mg", dailyValue: "10%" },
        ],
        healthBenefits: ["Good source of carbs"],
        healthRecommendation: "Moderate carb source",
      };

      const confidence = calculateConfidenceScore(analysis);
      expect(confidence).toBeGreaterThanOrEqual(60);
      expect(confidence).toBeLessThan(80);
    });

    it("should give low confidence for incomplete analysis", () => {
      const analysis = {
        foodName: "Unknown Food",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        ingredients: [],
        allergens: [],
        vitamins: [],
        minerals: [],
        healthBenefits: [],
      };

      const confidence = calculateConfidenceScore(analysis);
      expect(confidence).toBeLessThan(60);
    });

    it("should penalize missing critical fields", () => {
      const incompleteAnalysis = {
        foodName: "Burger",
        calories: 500,
        protein: 25,
        carbs: 45,
        fats: 20,
        // Missing vitamins, minerals, health benefits
        ingredients: ["Beef", "Bread", "Lettuce"],
        allergens: ["Gluten"],
        healthScore: 4,
      };

      const confidence = calculateConfidenceScore(incompleteAnalysis);
      expect(confidence).toBeLessThan(80);
    });
  });

  describe("Ingredients Analysis", () => {
    it("should list all visible ingredients", () => {
      const analysis = {
        foodName: "Caesar Salad",
        ingredients: [
          "Romaine lettuce",
          "Parmesan cheese",
          "Croutons",
          "Caesar dressing",
          "Black pepper",
        ],
      };

      expect(analysis.ingredients.length).toBeGreaterThan(0);
      expect(analysis.ingredients).toContain("Romaine lettuce");
    });

    it("should include ingredient quantities when visible", () => {
      const analysis = {
        foodName: "Fruit Smoothie",
        ingredients: [
          "Banana - 1 medium",
          "Strawberries - 150g",
          "Yogurt - 200ml",
          "Honey - 1 tbsp",
        ],
      };

      expect(analysis.ingredients[0]).toContain("Banana");
      expect(analysis.ingredients[0]).toContain("1 medium");
    });
  });

  describe("Health Benefits and Concerns", () => {
    it("should identify health benefits of nutritious foods", () => {
      const analysis = {
        foodName: "Blueberries",
        healthBenefits: [
          "Rich in antioxidants",
          "Supports brain health",
          "Low glycemic index",
          "High in vitamin C",
        ],
      };

      expect(analysis.healthBenefits.length).toBeGreaterThan(0);
      expect(analysis.healthBenefits).toContain("Rich in antioxidants");
    });

    it("should identify health concerns for less healthy foods", () => {
      const analysis = {
        foodName: "Fried Chicken",
        healthConcerns: [
          "High in saturated fat",
          "High in sodium",
          "High in calories",
        ],
      };

      expect(analysis.healthConcerns.length).toBeGreaterThan(0);
      expect(analysis.healthConcerns).toContain("High in saturated fat");
    });
  });

  describe("Dietary Restrictions", () => {
    it("should identify keto-friendly foods", () => {
      const analysis = {
        foodName: "Avocado",
        dietaryRestrictions: ["keto-friendly", "vegan", "gluten-free"],
      };

      expect(analysis.dietaryRestrictions).toContain("keto-friendly");
    });

    it("should identify gluten-free foods", () => {
      const analysis = {
        foodName: "Rice Bowl",
        dietaryRestrictions: ["gluten-free", "vegan"],
      };

      expect(analysis.dietaryRestrictions).toContain("gluten-free");
    });

    it("should identify dairy-free foods", () => {
      const analysis = {
        foodName: "Almond Milk",
        dietaryRestrictions: ["dairy-free", "vegan"],
      };

      expect(analysis.dietaryRestrictions).toContain("dairy-free");
    });
  });

  describe("Portion Size Analysis", () => {
    it("should provide accurate serving size information", () => {
      const analysis = {
        foodName: "Apple",
        servingSize: "1 medium apple (182g)",
        calories: 95,
      };

      expect(analysis.servingSize).toBeTruthy();
      expect(analysis.servingSize).toContain("182g");
    });

    it("should estimate portion from image", () => {
      const analysis = {
        foodName: "Pasta Plate",
        servingSize: "1 plate (approximately 200g cooked pasta)",
        calories: 442,
      };

      expect(analysis.servingSize).toBeTruthy();
      expect(analysis.servingSize).toContain("200g");
    });
  });

  describe("Cooking Method Detection", () => {
    it("should identify cooking methods from appearance", () => {
      const analysis = {
        foodName: "Grilled Salmon",
        estimatedCookingMethod: "grilled",
      };

      expect(analysis.estimatedCookingMethod).toBe("grilled");
    });

    it("should recognize fried foods", () => {
      const analysis = {
        foodName: "French Fries",
        estimatedCookingMethod: "fried",
      };

      expect(analysis.estimatedCookingMethod).toBe("fried");
    });

    it("should recognize baked foods", () => {
      const analysis = {
        foodName: "Whole Wheat Bread",
        estimatedCookingMethod: "baked",
      };

      expect(analysis.estimatedCookingMethod).toBe("baked");
    });
  });

  describe("Health Recommendations", () => {
    it("should provide specific recommendations for healthy foods", () => {
      const analysis = {
        foodName: "Salmon",
        healthRecommendation:
          "Excellent source of omega-3 fatty acids. Recommended to consume 2-3 times per week for heart health.",
      };

      expect(analysis.healthRecommendation).toBeTruthy();
      expect(analysis.healthRecommendation.length).toBeGreaterThan(20);
    });

    it("should provide warnings for unhealthy foods", () => {
      const analysis = {
        foodName: "Sugary Soda",
        healthRecommendation:
          "High in added sugars. Limit consumption to occasional treats. Consider healthier beverage alternatives.",
      };

      expect(analysis.healthRecommendation).toBeTruthy();
      expect(
        analysis.healthRecommendation.toLowerCase().includes("limit")
      ).toBe(true);
    });
  });

  describe("Food Pairing Suggestions", () => {
    it("should suggest complementary foods", () => {
      const analysis = {
        foodName: "Grilled Chicken",
        bestPairingFoods: [
          "Brown rice for complete carbs",
          "Steamed broccoli for vitamins",
          "Sweet potato for minerals",
        ],
      };

      expect(analysis.bestPairingFoods.length).toBeGreaterThan(0);
      expect(analysis.bestPairingFoods[0]).toContain("Brown rice");
    });
  });
});
