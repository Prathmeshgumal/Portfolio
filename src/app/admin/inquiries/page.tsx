import type { Metadata } from "next";
import { Mail, Phone, Trash2 } from "lucide-react";
import { deleteInquiry, logout } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { db, type Inquiry } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Inquiries",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function InquiriesPage() {
  await requireAdmin();

  const inquiries = await db()<Inquiry[]>`
    SELECT id, name, email, phone, note, created_at
    FROM inquiries
    ORDER BY created_at DESC
    LIMIT 500
  `;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inquiries</h1>
          <p className="text-sm text-muted-foreground">
            {inquiries.length === 0
              ? "No messages yet."
              : `${inquiries.length} message${inquiries.length === 1 ? "" : "s"}, newest first.`}
          </p>
        </div>
        <form action={logout}>
          <Button variant="outline" size="sm" type="submit">
            Log out
          </Button>
        </form>
      </div>

      <ul className="flex flex-col gap-3">
        {inquiries.map((inq) => (
          <li key={inq.id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{inq.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <a
                    href={`mailto:${inq.email}`}
                    className="inline-flex items-center gap-1 break-all hover:text-foreground hover:underline"
                  >
                    <Mail className="size-3.5 shrink-0" aria-hidden />
                    {inq.email}
                  </a>
                  {inq.phone && (
                    <a
                      href={`tel:${inq.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                    >
                      <Phone className="size-3.5 shrink-0" aria-hidden />
                      {inq.phone}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <time
                  dateTime={inq.created_at.toISOString()}
                  className="text-xs tabular-nums text-muted-foreground"
                >
                  {dateFormat.format(inq.created_at)}
                </time>
                <form action={deleteInquiry}>
                  <input type="hidden" name="id" value={inq.id} />
                  <button
                    type="submit"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                    aria-label={`Delete message from ${inq.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{inq.note}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
