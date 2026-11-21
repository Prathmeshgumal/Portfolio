import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import OpenContactButton from "@/components/open-contact-button";
import { DATA } from "@/data/resume";

const linkStyle =
  "text-blue-500 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm";

export default function ContactSection() {
  return (
    <div data-byte-perch data-byte-say="psst… say hi! →" data-byte-point className="border rounded-xl p-10 relative">
      <div className="absolute -top-4 border bg-primary z-10 rounded-xl px-4 py-1 left-1/2 -translate-x-1/2">
        <span className="text-background text-sm font-medium">Contact</span>
      </div>
      <div className="absolute inset-0 top-0 left-0 right-0 h-1/2 rounded-xl overflow-hidden">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={2}
          gridGap={2}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Get in Touch
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground text-balance">
          Want to chat about a role or a project?{" "}
          <OpenContactButton className={linkStyle}>Send me a message</OpenContactButton>{" "}
          or reach out on{" "}
          <Link
            href={DATA.contact.social.LinkedIn.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyle}
          >
            LinkedIn
          </Link>
          .
        </p>
        <OpenContactButton className="group mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-primary pl-5 pr-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <MessageSquare className="size-4" aria-hidden />
          Get in touch
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </OpenContactButton>
      </div>
    </div>
  );
}

