import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * A one-way hash of the visitor's IP address. It lets us rate-limit
 * without storing anyone's real IP in the database.
 */
export async function getIpHash() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? ""}:${ip}`)
    .digest("hex");
}
