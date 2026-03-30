import "dotenv/config";
import { invokeLLM } from "./server/_core/llm";
import * as fs from "fs";
import * as https from "https";

// Download a real food image and test the full analysis pipeline
async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function detectMimeType(base64Data: string): string {
  const raw = base64Data.substring(0, 16);
  if (raw.startsWith("/9j/")) return "image/jpeg";
  if (raw.startsWith("iVBOR")) return "image/png";
  if (raw.startsWith("UklGR")) return "image/webp";
  if (raw.startsWith("R0lGO")) return "image/gif";
  return "image/jpeg";
}

async function testWithRealImage() {
  console.log("=== Testing Food Scanning Accuracy ===\n");

  // Use a public domain food image (pizza from unsplash)
  const imageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80";
  console.log("Downloading test image (pizza)...");

  let imageBuffer: Buffer;
  try {
    imageBuffer = await downloadImage(imageUrl);
    console.log(`Downloaded: ${imageBuffer.length} bytes`);
  } catch (e) {
    console.error("Failed to download image, using a fallback test...");
    // Fallback: just test with a simple prompt to verify LLM connectivity
    const response = await invokeLLM({
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a nutritionist. Respond with JSON only.",
        },
        {
          role: "user",
          content: "Tell me the nutritional info for a cheese pizza slice (1 slice, ~107g). Respond with JSON: {\"foodName\": string, \"calories\": number, \"protein\": number, \"carbs\": number, \"fats\": number}",
        },
      ],
    });
    console.log("\n--- Text-only fallback response ---");
    console.log(response.choices[0].message.content);
    return;
  }

  const base64Data = imageBuffer.toString("base64");
  const mimeType = detectMimeType(base64Data);
  console.log(`MIME detected: ${mimeType}`);
  console.log(`Base64 length: ${base64Data.length} chars`);
  console.log(`First 20 chars of base64: ${base64Data.substring(0, 20)}`);

  console.log("\nSending to Gemini 2.0 Flash with response_format: json_object...\n");

  try {
    const startTime = Date.now();
    const response = await invokeLLM({
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
                url: `data:${mimeType};base64,${base64Data}`,
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
    const elapsed = Date.now() - startTime;

    console.log(`Response received in ${elapsed}ms`);
    console.log(`Model: ${response.model}`);
    console.log(`Tokens: prompt=${response.usage?.prompt_tokens}, completion=${response.usage?.completion_tokens}`);
    console.log(`Finish reason: ${response.choices[0]?.finish_reason}`);
    console.log(`\n--- RAW RESPONSE ---`);
    const content = response.choices[0]?.message?.content;
    console.log(typeof content === "string" ? content : JSON.stringify(content));

    // Try parsing
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        console.log(`\n--- PARSED RESULT ---`);
        console.log(`Food Name: ${parsed.foodName}`);
        console.log(`Calories: ${parsed.calories}`);
        console.log(`Protein: ${parsed.protein}g`);
        console.log(`Carbs: ${parsed.carbs}g`);
        console.log(`Fats: ${parsed.fats}g`);
        console.log(`Health Score: ${parsed.healthScore}/10`);
        console.log(`Vitamins: ${parsed.vitamins?.length || 0}`);
        console.log(`Minerals: ${parsed.minerals?.length || 0}`);
        console.log(`Ingredients: ${parsed.ingredients?.join(", ")}`);
      } catch (e) {
        console.error("\nFailed to parse JSON:", e);
        console.log("Attempting markdown fence strip...");
        const cleaned = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
        try {
          const parsed = JSON.parse(cleaned);
          console.log("Parsed after strip:", parsed.foodName);
        } catch (e2) {
          console.error("Still failed:", e2);
        }
      }
    }
  } catch (err: any) {
    console.error("LLM Error:", err.message || err);
  }
}

testWithRealImage();
