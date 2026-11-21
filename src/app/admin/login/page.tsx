import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/session";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/admin/inquiries");

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-sm flex-col justify-center gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to see messages from the contact form.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
