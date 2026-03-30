import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });
import * as fs from "fs";

import { appRouter } from "./server/routers";

async function testRouter() {
  console.log("Testing router...");
  const mockCtx = {
    req: {} as any,
    res: {} as any,
    user: {
      id: 1,
      openId: "dev_user",
      name: "Dev User",
      email: "dev@scaneat.local",
      loginMethod: "google",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any
  };

  const caller = appRouter.createCaller(mockCtx);
  try {
    const result = await caller.food.analyzeFood({
      imageData: "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    });
    console.log("Success:", result);
  } catch (error) {
    fs.writeFileSync("error-log.json", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("Router Error!");
  }
}

testRouter();
