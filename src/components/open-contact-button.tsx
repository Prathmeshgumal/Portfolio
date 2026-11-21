"use client";

import { openContactWidget } from "@/components/contact-widget";

/** A button that opens the "Get in touch" widget in the bottom-right corner. */
export default function OpenContactButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={openContactWidget}
      aria-controls="contact-widget"
      className={className}
    >
      {children}
    </button>
  );
}
