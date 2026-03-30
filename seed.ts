import "dotenv/config";
import { getDb } from "./server/db";
import { users } from "./drizzle/schema";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("No database connection");
    process.exit(1);
  }

  try {
    await db.insert(users).values({
      id: 1, // Explicitly set to 1 for DEV_BYPASS_AUTH
      openId: "dev_user",
      name: "Dev User",
      email: "dev@scaneat.local",
      loginMethod: "google",
      role: "admin",
    });
    console.log("Mock user with ID 1 seeded successfully!");
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      console.log("Mock user already exists.");
    } else {
      console.error("Error seeding user:", error);
    }
  }
  process.exit(0);
}

seed();
