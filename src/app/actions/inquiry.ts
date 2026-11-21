"use server";

import { after } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { sql } from "@/lib/db";
import { getIpHash } from "@/lib/request";

const MAX_PER_HOUR = 3;

const InquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.email("Please enter a valid email").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+()\d\s-]*$/, "Phone can only contain digits, spaces, +, - and ()")
    .optional()
    .or(z.literal("")),
  note: z.string().trim().min(1, "Please add a short note").max(2000),
});

export type InquiryState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "note", string>>;
  /** What the visitor typed, so the form can be refilled after an error. */
  values?: Record<"name" | "email" | "phone" | "note", string>;
};

export async function submitInquiry(
  _prev: InquiryState | null,
  formData: FormData
): Promise<InquiryState> {
  // Honeypot: real visitors never see or fill this field; bots usually do.
  if (formData.get("website")) {
    return { ok: true, message: "Thanks! I'll get back to you soon." };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
  const parsed = InquirySchema.safeParse(values);

  if (!parsed.success) {
    const errors: InquiryState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<InquiryState["errors"]>;
      errors[field] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", errors, values };
  }

  const { name, email, phone, note } = parsed.data;
  const ipHash = await getIpHash();

  try {
    const [{ count }] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM inquiries
      WHERE ip_hash = ${ipHash} AND created_at > now() - interval '1 hour'
    `;
    if (count >= MAX_PER_HOUR) {
      return {
        ok: false,
        message: "You've sent a few messages already. Please try again later.",
        values,
      };
    }

    await sql`
      INSERT INTO inquiries (name, email, phone, note, ip_hash)
      VALUES (${name}, ${email}, ${phone || null}, ${note}, ${ipHash})
    `;
  } catch (error) {
    console.error("Failed to save inquiry", error);
    return {
      ok: false,
      message: "Something went wrong on my side. Please try again or email me.",
      values,
    };
  }

  // Send the notification after the response, so the visitor isn't kept waiting.
  after(() => notifyByEmail({ name, email, phone: phone || null, note }));

  return { ok: true, message: "Thanks! I'll get back to you soon." };
}

async function notifyByEmail(inquiry: {
  name: string;
  email: string;
  phone: string | null;
  note: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return; // Email notifications are optional.

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.NOTIFY_FROM ?? "Portfolio <onboarding@resend.dev>",
      to,
      replyTo: inquiry.email,
      subject: `New inquiry from ${inquiry.name}`,
      text: [
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Phone: ${inquiry.phone ?? "-"}`,
        "",
        inquiry.note,
      ].join("\n"),
    });
    if (error) console.error("Resend error", error);
  } catch (error) {
    console.error("Failed to send notification email", error);
  }
}
