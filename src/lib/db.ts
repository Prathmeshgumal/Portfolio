import "server-only";
import postgres from "postgres";

declare global {
  // Reuse one client across hot reloads in development.
  var __sql: postgres.Sql | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Serverless functions are short-lived, so keep the pool tiny.
  // `prepare: false` keeps it compatible with Neon's pooled connection string.
  return postgres(url, { max: 1, prepare: false, idle_timeout: 20 });
}

export const sql = globalThis.__sql ?? createClient();
if (process.env.NODE_ENV !== "production") globalThis.__sql = sql;

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  note: string;
  created_at: Date;
};
