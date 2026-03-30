import "dotenv/config";
import { getDb } from "./server/db";
import { users } from "./drizzle/schema";

async function check() {
  const db = (await getDb())!;
  const allUsers = await db.select().from(users);
  console.log("Users in DB:", allUsers);
  process.exit(0);
}

check();
