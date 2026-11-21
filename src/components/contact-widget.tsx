"use client";

import {
  ArrowRight,
  Check,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";

const NOTE_LIMIT = 2000;

/** Dispatch this on `window` to open the contact widget from anywhere. */
export const OPEN_CONTACT_EVENT = "open-contact-widget";

export function openContactWidget() {
  window.dispatchEvent(new Event(OPEN_CONTACT_EVENT));
}

const fieldShell =
  "group/field relative flex items-center rounded-xl border border-transparent bg-muted/60 transition-all focus-within:border-foreground/15 focus-within:bg-background focus-within:shadow-[0_0_0_4px] focus-within:shadow-foreground/[0.04] has-[[aria-invalid=true]]:border-destructive/60 has-[[aria-invalid=true]]:bg-destructive/[0.04]";

const fieldInput =
  "peer w-full bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-muted-foreground/70";

function FieldIcon({ icon: Icon }: { icon: typeof User }) {
  return (
    <Icon
      aria-hidden
      className="pointer-events-none ml-3 mr-2 size-4 shrink-0 text-muted-foreground/70 transition-colors group-focus-within/field:text-foreground"
    />
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden pl-1 text-[11px] text-destructive"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

function InquiryForm({
  open,
  firstFieldRef,
  onSent,
}: {
  open: boolean;
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  onSent: () => void;
}) {
  const [state, action, pending] = useActionState<InquiryState | null, FormData>(
    submitInquiry,
    null
  );
  const [noteLength, setNoteLength] = useState(state?.values?.note.length ?? 0);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center px-2 pb-2 pt-4 text-center" role="status">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="relative mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-500/20"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Check className="size-5" strokeWidth={3} aria-hidden />
          </span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm font-semibold"
        >
          Message sent!
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-0.5 text-xs text-muted-foreground"
        >
          Thanks for reaching out. I&apos;ll get back to you soon.
        </motion.p>
        <button
          type="button"
          onClick={onSent}
          className="mt-4 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Done
        </button>
      </div>
    );
  }

  const e = state?.errors ?? {};
  const v = state?.values;

  return (
    <motion.form
      action={action}
      noValidate
      className="flex flex-col gap-2.5"
      variants={stagger}
      initial="hidden"
      animate={open ? "show" : "hidden"}
    >
      <motion.div variants={rise} className="flex flex-col gap-1">
        <label htmlFor="ci-name" className="sr-only">
          Name
        </label>
        <div className={fieldShell}>
          <FieldIcon icon={User} />
          <input
            ref={firstFieldRef}
            id="ci-name"
            name="name"
            placeholder="Your name"
            autoComplete="name"
            maxLength={100}
            defaultValue={v?.name}
            className={fieldInput}
            aria-invalid={!!e.name}
            aria-describedby={e.name ? "ci-name-error" : undefined}
          />
        </div>
        <FieldError id="ci-name-error" message={e.name} />
      </motion.div>

      <motion.div variants={rise} className="flex flex-col gap-1">
        <label htmlFor="ci-email" className="sr-only">
          Email
        </label>
        <div className={fieldShell}>
          <FieldIcon icon={Mail} />
          <input
            id="ci-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            maxLength={200}
            defaultValue={v?.email}
            className={fieldInput}
            aria-invalid={!!e.email}
            aria-describedby={e.email ? "ci-email-error" : undefined}
          />
        </div>
        <FieldError id="ci-email-error" message={e.email} />
      </motion.div>

      <motion.div variants={rise} className="flex flex-col gap-1">
        <label htmlFor="ci-phone" className="sr-only">
          Contact number (optional)
        </label>
        <div className={fieldShell}>
          <FieldIcon icon={Phone} />
          <input
            id="ci-phone"
            name="phone"
            type="tel"
            placeholder="Phone number"
            autoComplete="tel"
            maxLength={30}
            defaultValue={v?.phone}
            className={fieldInput}
            aria-invalid={!!e.phone}
            aria-describedby={e.phone ? "ci-phone-error" : undefined}
          />
          <span className="mr-3 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border">
            optional
          </span>
        </div>
        <FieldError id="ci-phone-error" message={e.phone} />
      </motion.div>

      <motion.div variants={rise} className="flex flex-col gap-1">
        <label htmlFor="ci-note" className="sr-only">
          Message
        </label>
        <div className={cn(fieldShell, "flex-col items-stretch")}>
          <textarea
            id="ci-note"
            name="note"
            rows={3}
            placeholder="Hi Prathmesh, I'd love to chat about…"
            maxLength={NOTE_LIMIT}
            defaultValue={v?.note}
            onChange={(event) => setNoteLength(event.target.value.length)}
            className="w-full resize-none bg-transparent px-3 pb-1 pt-2.5 text-sm outline-none placeholder:text-muted-foreground/70"
            aria-invalid={!!e.note}
            aria-describedby={e.note ? "ci-note-error" : undefined}
          />
          <span
            aria-hidden
            className={cn(
              "self-end px-3 pb-1.5 text-[10px] tabular-nums text-muted-foreground/60 transition-colors",
              noteLength > NOTE_LIMIT * 0.9 && "text-amber-600"
            )}
          >
            {noteLength}/{NOTE_LIMIT}
          </span>
        </div>
        <FieldError id="ci-note-error" message={e.note} />
      </motion.div>

      {/* Honeypot for bots: hidden from people and screen readers. */}
      <div hidden>
        <label htmlFor="ci-website">Website</label>
        <input id="ci-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state && !state.ok && !state.errors && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.message}
        </p>
      )}

      <motion.div variants={rise}>
        <button
          type="submit"
          disabled={pending}
          className="group/send relative mt-1 inline-flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.2)] transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover/send:translate-x-0.5"
                aria-hidden
              />
            </>
          )}
        </button>
      </motion.div>

      <motion.p variants={rise} className="text-center text-[11px] text-muted-foreground">
        or email me at{" "}
        <a
          href={`mailto:${DATA.contact.email}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {DATA.contact.email}
        </a>
      </motion.p>
    </motion.form>
  );
}

export default function ContactWidget() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  // Bumped after a successful send, so the next message starts with an empty form.
  const [formKey, setFormKey] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    // Close when the visitor clicks or taps anywhere outside the widget.
    // Typed text is kept, because the panel stays mounted while closed.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      // Buttons that open the widget handle themselves; don't close-then-reopen.
      if (target.closest('[aria-controls="contact-widget"]')) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Lets other parts of the page (like the "Get in Touch" section) open the widget.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CONTACT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, onOpen);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 30 };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {/* The panel stays mounted while closed, so half-typed text isn't lost. */}
      <motion.section
        id="contact-widget"
        role="dialog"
        aria-modal="false"
        aria-labelledby="contact-widget-title"
        inert={!open}
        initial={false}
        animate={
          open
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 12, scale: 0.94, filter: "blur(4px)" }
        }
        transition={spring}
        style={{ transformOrigin: "bottom right" }}
        className={cn(
          "relative w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border bg-card shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]",
          !open && "pointer-events-none"
        )}
      >
        {/* Soft colour wash behind the header. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(100%_100%_at_100%_0%,rgba(16,185,129,0.12),transparent_55%)]"
        />

        <div className="relative flex items-center gap-3 px-5 pb-4 pt-5">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DATA.avatarUrl}
              alt=""
              className="size-11 rounded-full object-cover ring-2 ring-background shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-background">
              <span className="absolute size-2.5 animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative size-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="contact-widget-title" className="text-sm font-semibold leading-tight">
              Let&apos;s talk 👋
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Usually replies within a day
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-1.5 self-start rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative px-5 pb-5">
          <InquiryForm
            key={formKey}
            open={open}
            firstFieldRef={firstFieldRef}
            onSent={() => {
              close();
              setFormKey((k) => k + 1);
            }}
          />
        </div>
      </motion.section>

      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="contact-widget"
        // Set explicitly: motion adds tabindex only when tap animations are on,
        // which differs between server and a reduced-motion browser.
        tabIndex={0}
        whileHover={reduceMotion ? undefined : { y: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className="group flex h-12 items-center gap-2.5 rounded-full border bg-card/90 py-1.5 pl-1.5 pr-5 text-sm font-medium shadow-[0_8px_24px_-6px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-shadow hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="relative flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {open ? (
                <X className="size-4" aria-hidden />
              ) : (
                <MessageSquare className="size-4" aria-hidden />
              )}
            </motion.span>
          </AnimatePresence>
          {!open && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          )}
        </span>
        {open ? "Close" : "Get in touch"}
      </motion.button>
    </div>
  );
}
