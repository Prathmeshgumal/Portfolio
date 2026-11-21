// Creates the database tables. Safe to run more than once.
// Usage: pnpm db:setup   (reads DATABASE_URL from .env.local)
import { readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

try {
  await sql.unsafe(schema);
  console.log("Database tables are ready.");
} finally {
  await sql.end();
}
