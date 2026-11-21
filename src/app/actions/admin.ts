"use server";

import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getIpHash } from "@/lib/request";
import { createSession, deleteSession, requireAdmin } from "@/lib/session";

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export type LoginState = { error: string } | null;

function sameString(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const expectedUser = process.env.ADMIN_USERNAME;
  const hashB64 = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !hashB64) {
    return { error: "Admin login is not configured on the server." };
  }

  const ipHash = await getIpHash();
  const [{ count }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM login_attempts
    WHERE ip_hash = ${ipHash}
      AND created_at > now() - make_interval(mins => ${LOCKOUT_MINUTES})
  `;
  if (count >= MAX_FAILED_LOGINS) {
    return {
      error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
    };
  }

  const hash = Buffer.from(hashB64, "base64").toString("utf8");
  // Always run bcrypt, even for a wrong username, so timing gives nothing away.
  const passwordOk = await bcrypt.compare(password, hash);
  const userOk = sameString(username, expectedUser);

  if (!passwordOk || !userOk) {
    await sql`INSERT INTO login_attempts (ip_hash) VALUES (${ipHash})`;
    return { error: "Wrong username or password." };
  }

  await sql`DELETE FROM login_attempts WHERE ip_hash = ${ipHash}`;
  await createSession(expectedUser);
  redirect("/admin/inquiries");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export async function deleteInquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;
  await sql`DELETE FROM inquiries WHERE id = ${id}`;
  revalidatePath("/admin/inquiries");
}
