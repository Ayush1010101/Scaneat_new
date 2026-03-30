import "dotenv/config";
import { invokeLLM } from "./server/_core/llm";

const tinyRedImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAARABQBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function test() {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert nutritionist, food scientist, and health coach. Analyze the food image with EXTREME precision and provide COMPREHENSIVE nutritional information for health-conscious users.
          
IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, no extra text.

Provide DETAILED analysis with these exact fields:
{
  "foodName": "specific food name",
  "foodDescription": "detailed description"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: tinyRedImage,
                detail: "high",
              },
            },
            {
              type: "text",
              text: "Analyze this food image.",
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      maxTokens: 2000,
    });
    console.log("LLM Content:");
    console.log(response.choices[0].message.content);
    const parsed = JSON.parse(response.choices[0].message.content as string);
    console.log("Parsed Successfully:", parsed);
  } catch (err: any) {
    console.error("LLM Error:", err);
  }
}

test();
