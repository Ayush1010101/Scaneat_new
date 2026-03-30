import "dotenv/config";
import { invokeLLM } from "./server/_core/llm";

const tinyRedImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAARABQBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function test() {
  try {
    const response = await invokeLLM({
      messages: [
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
              text: "What is this?",
            },
          ],
        },
      ],
      response_format: { type: "text" },
    });
    console.log("Success:", JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error("LLM Error:", err);
  }
}

test();
