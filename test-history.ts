import "dotenv/config";
import { appRouter } from "./server/routers";

async function testHistory() {
  const mockCtx = {
    req: {} as any,
    res: {} as any,
    user: { id: 1 } as any
  };

  const caller = appRouter.createCaller(mockCtx);
  try {
    const result = await caller.food.getScanHistory({});
    console.log("Success! Found scans:", result.length);
  } catch (error: any) {
    console.error("History Error!", String(error.stack || error));
    import("fs").then(fs => fs.writeFileSync("history-err.txt", String(error.stack || error)));
  }
  process.exit(0);
}

testHistory();
