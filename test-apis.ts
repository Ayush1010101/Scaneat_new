import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

async function testAWS() {
  console.log("Testing AWS S3...");
  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: "test-scan-file.txt",
        Body: "test",
        ContentType: "text/plain",
      })
    );
    console.log("✅ AWS S3 Working");
  } catch (error: any) {
    console.log("❌ AWS S3 FAILED:", error.message);
  }
}

async function testGemini() {
  console.log("\\nTesting Gemini...");
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: "Say hello!" }]
      })
    });
    
    if (!response.ok) {
      console.log("❌ Gemini FAILED:", await response.text());
    } else {
      console.log("✅ Gemini Working");
    }
  } catch (err: any) {
    console.log("❌ Gemini FAILED:", err.message);
  }
}

async function run() {
  await testAWS();
  await testGemini();
}

run();
