"use client";

import { CheckCircle2, Loader2, MessageSquare, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-input bg-background/60 px-3 py-1.5 text-sm placeholder:text-muted-foreground/70 transition-colors focus-visible:border-foreground/30 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 aria-[invalid=true]:border-destructive";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-[11px] text-destructive">
      {message}
    </p>
  );
}

function InquiryForm({
  firstFieldRef,
  onSent,
}: {
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  onSent: () => void;
}) {
  const [state, action, pending] = useActionState<InquiryState | null, FormData>(
    submitInquiry,
    null
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
        <CheckCircle2 className="size-9 text-green-600" aria-hidden />
        <p className="text-sm font-medium" role="status">
          {state.message}
        </p>
        <button
          type="button"
          onClick={onSent}
          className="mt-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  const e = state?.errors ?? {};
  const v = state?.values;

  return (
    <form action={action} className="flex flex-col gap-2.5" noValidate>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <label htmlFor="ci-name" className="sr-only">
            Name
          </label>
          <input
            ref={firstFieldRef}
            id="ci-name"
            name="name"
            placeholder="Name"
            autoComplete="name"
            maxLength={100}
            defaultValue={v?.name}
            className={inputClass}
            aria-invalid={!!e.name}
            aria-describedby={e.name ? "ci-name-error" : undefined}
          />
          <FieldError id="ci-name-error" message={e.name} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="ci-phone" className="sr-only">
            Contact number (optional)
          </label>
          <input
            id="ci-phone"
            name="phone"
            type="tel"
            placeholder="Phone (optional)"
            autoComplete="tel"
            maxLength={30}
            defaultValue={v?.phone}
            className={inputClass}
            aria-invalid={!!e.phone}
            aria-describedby={e.phone ? "ci-phone-error" : undefined}
          />
          <FieldError id="ci-phone-error" message={e.phone} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ci-email" className="sr-only">
          Email
        </label>
        <input
          id="ci-email"
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          maxLength={200}
          defaultValue={v?.email}
          className={inputClass}
          aria-invalid={!!e.email}
          aria-describedby={e.email ? "ci-email-error" : undefined}
        />
        <FieldError id="ci-email-error" message={e.email} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ci-note" className="sr-only">
          Note
        </label>
        <textarea
          id="ci-note"
          name="note"
          rows={3}
          placeholder="What would you like to talk about?"
          maxLength={2000}
          defaultValue={v?.note}
          className={cn(inputClass, "resize-none")}
          aria-invalid={!!e.note}
          aria-describedby={e.note ? "ci-note-error" : undefined}
        />
        <FieldError id="ci-note-error" message={e.note} />
      </div>

      {/* Honeypot for bots: hidden from people and screen readers. */}
      <div hidden>
        <label htmlFor="ci-website">Website</label>
        <input id="ci-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state && !state.ok && !state.errors && (
        <p role="alert" className="text-xs text-destructive">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-0.5 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            Submit
            <Send className="size-3.5" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}

export default function ContactWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Bumped after a successful send, so the next message starts with an empty form.
  const [formKey, setFormKey] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40 flex flex-col items-start gap-3 sm:bottom-6 sm:left-6">
      {/* The panel stays mounted while closed, so half-typed text isn't lost. */}
      <section
        id="contact-widget"
        role="dialog"
        aria-modal="false"
        aria-labelledby="contact-widget-title"
        inert={!open}
        className={cn(
          "w-[min(20rem,calc(100vw-2rem))] origin-bottom-left rounded-2xl border bg-card/95 p-4 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-200 ease-out dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.6)]",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0"
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <div>
              <h2 id="contact-widget-title" className="text-sm font-semibold leading-tight">
                Get in touch
              </h2>
              <p className="text-xs text-muted-foreground">I usually reply within a day.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-m-1 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
        <InquiryForm
          key={formKey}
          firstFieldRef={firstFieldRef}
          onSent={() => {
            close();
            setFormKey((k) => k + 1);
          }}
        />
      </section>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="contact-widget"
        className="group flex h-11 items-center gap-2 rounded-full border bg-card/90 pl-3 pr-4 text-sm font-medium shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
          {open ? (
            <X className="size-3.5" aria-hidden />
          ) : (
            <MessageSquare className="size-3.5" aria-hidden />
          )}
        </span>
        {open ? "Close" : "Get in touch"}
      </button>
    </div>
  );
}
