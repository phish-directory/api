import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../db/schema";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  // casing: "camelCase",
});
