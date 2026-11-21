import { Icons } from "@/components/icons";
import { HomeIcon } from "lucide-react";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Python } from "@/components/ui/svgs/python";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
import { ReactLight } from "@/components/ui/svgs/reactLight";

type Skill = {
  name: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const DATA = {
  name: "Prathmesh Gumal",
  initials: "PG",
  // TODO: change this to your real domain once the site is deployed
  url: "https://prathmeshgumal.vercel.app",
  location: "Hyderabad, India",
  locationLink: "https://www.google.com/maps/place/Hyderabad",
  description:
    "Full-Stack AI Engineer building production software, AI-powered applications and multi-agent systems.",
  summary:
    "I'm a Full-Stack AI Engineer at [Deepstack Software](/#work) in Hyderabad. I work across the whole product lifecycle — spotting a business problem, designing the solution, then building and shipping it.\n\nAt RAAM Group I [built a centralized dealership CRM](/#work) that turned scattered sales operations into one system used across Ather and Toyota dealerships. At Deepstack I build AI-driven platforms with the Claude Agent SDK, and in my own time I ship products like [Pedit](/#projects), an AI video editor, using Claude Code and Codex.",
  avatarUrl: "/me.jpg",
  skills: [
    { name: "Python", icon: Python },
    { name: "TypeScript", icon: Typescript },
    { name: "C++" },
    { name: "Next.js", icon: NextjsIconDark },
    { name: "React Native", icon: ReactLight },
    { name: "FastAPI" },
    { name: "Flask" },
    { name: "Celery" },
    { name: "Prisma" },
    { name: "PostgreSQL", icon: Postgresql },
    { name: "MySQL" },
    { name: "Redis" },
    { name: "Supabase" },
    { name: "Claude Agent SDK" },
    { name: "LangGraph" },
    { name: "LangChain" },
    { name: "RAG" },
    { name: "MCP" },
    { name: "FAISS" },
    { name: "Pinecone" },
    { name: "AWS" },
    { name: "Docker", icon: Docker },
    { name: "Sentry" },
    { name: "Git" },
  ] as Skill[],
  navbar: [{ href: "/", icon: HomeIcon, label: "Home" }],
  contact: {
    email: "prathmeshgumal@gmail.com",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Prathmeshgumal",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/prathmesh-gumal-42b81b185/",
        icon: Icons.linkedin,
        navbar: true,
      },
      Email: {
        name: "Email",
        url: "mailto:prathmeshgumal@gmail.com",
        icon: Icons.email,
        navbar: true,
      },
    },
  },

  work: [
    {
      company: "Deepstack Software",
      href: "https://www.deepstacksoft.com",
      location: "Hyderabad",
      title: "Software Engineer",
      logoUrl: "/deepstack.png",
      start: "May 2026",
      end: "Present",
      description: `**AI Sales Research Platform** (internal product)
- Built a distributed AI research platform on the **Claude Agent SDK** with specialised research agents and custom tools for Google Search, Crunchbase and LinkedIn.
- Engineered data-extraction infrastructure with FastAPI, PostgreSQL, WebSockets and browser-extension workers, including parser-drift detection and session recovery.
- Built long-running agent orchestration with recurring schedules, completion triggers, per-goal model selection and token-cost optimisation.

**AI Hiring Platform** (client project)
- Built AI recruitment workflows: resume parsing, job requirement generation, candidate screening and multi-criteria evaluation, plus risk analysis using LinkedIn, GitHub, Twilio and Google Search.
- Engineered async processing with **Celery and Redis**, supporting up to 100 concurrent workers with retries, timeouts and callbacks.
- Integrated **Ashby, Greenhouse and Lever** with two-way ATS sync for AI-generated candidate scores.`,
    },
    {
      company: "Deepstack Software",
      href: "https://www.deepstacksoft.com",
      location: "Hyderabad",
      title: "AI/ML Intern",
      logoUrl: "/deepstack.png",
      start: "Dec 2025",
      end: "Apr 2026",
      description: `- **Led a team of 3 developers** building a chess learning platform for children and schools, owning technical execution end to end.
- Built backend and mobile features: student onboarding, curriculum delivery, push notifications and admin workflows for parents, coaches and schools.
- Implemented **Razorpay subscription billing** and school contracts: recurring mandates, plan changes, cancellations, prorated amendments and webhooks.
- Designed role-based access control across parent, coach and school-admin workflows.`,
    },
    {
      company: "RAAM Group",
      href: "https://toyota.epicleads.in/",
      location: "Hyderabad",
      title: "Software Development Intern",
      logoUrl: "/raam.png",
      start: "Jun 2025",
      end: "Dec 2025",
      description: `- Spotted fragmented dealership sales operations with no central lead tracking, and **independently conceived a CRM** covering the full funnel from lead to conversion.
- Built and presented a working prototype **in one week**, winning management buy-in for a full CRM for Ather and Toyota dealerships.
- **Owned end-to-end development for six months**: lead management, sales tracking, role-based access and real-time conversion analytics.
- Built a **RAG-powered analytics assistant** so sales teams can ask questions of live CRM data in plain English, using schema-aware retrieval and validated SQL generation.`,
    },
  ],
  education: [
    {
      school: "Vishwakarma Institute of Information Technology (VIIT), Pune",
      href: "https://www.viit.ac.in",
      degree: "B.Tech in Artificial Intelligence and Data Science · CGPA 8.1",
      logoUrl: "/viit.png",
      start: "2022",
      end: "2026",
    },
  ],
  projects: [
    {
      title: "Pedit",
      href: "https://github.com/Prathmeshgumal/pedit",
      dates: "AI-powered desktop video editor",
      active: true,
      description:
        "A desktop video editor with a multi-track timeline, real-time preview, transitions, colour grading and 4K/120fps support — V1 built in **2 days** with AI coding agents. Claude edits video through **35 custom MCP tools** with reviewable drafts and Accept/Reject controls. GPU-accelerated rendering with WebGL2 and WebCodecs, FFmpeg for export.",
      technologies: [
        "Electron",
        "React",
        "TypeScript",
        "WebGL2",
        "WebCodecs",
        "FFmpeg",
        "MCP",
        "Claude",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Prathmeshgumal/pedit",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/pedit.jpg",
      video: "",
    },
    {
      title: "DSA Tutor",
      href: "https://github.com/Prathmeshgumal/my-dsa-tutor",
      dates: "Local DSA practice editor with a Claude tutor",
      active: true,
      description:
        "A browser-based editor for practising DSA in C++, Java and Python, with a **LeetCode-style judge** and **step-by-step dry runs of your own code** that pinpoint the exact step where a bug shows up. A Claude tutor reads your code and runs your tests through **21 custom tools**, but every change it proposes waits for your Apply. Code runs locally in a sandboxed Piston container.",
      technologies: [
        "React",
        "TypeScript",
        "Monaco",
        "Python",
        "Docker",
        "Piston",
        "Claude Code",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Prathmeshgumal/my-dsa-tutor",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/dsa-tutor.jpg",
      video: "",
    },
    {
      title: "nib",
      href: "https://nib-note.vercel.app",
      dates: "Terminal-first Markdown notes",
      active: true,
      description:
        "A Markdown note taker that runs in your terminal **and** in your browser from one **21 MB Go binary**. Both views share a single local SQLite file — nothing to sync, no account, no cloud. Opens a thousand notes in **under 20 ms**, uses about 28 MB of memory, and leaves nothing running when you quit. Press `W` to open the same notes as a block editor in the browser.",
      technologies: ["Go", "SQLite", "React", "JavaScript", "Terminal UI"],
      links: [
        {
          type: "Website",
          href: "https://nib-note.vercel.app",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Prathmeshgumal/nib",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/nib-card.jpg",
      video: "",
    },
    {
      title: "Verp",
      href: "https://github.com/Prathmeshgumal/Verp",
      dates: "GPS-based workforce attendance system",
      active: true,
      description:
        "Attendance and workforce management for a construction business: a backend API, an Android app and an admin dashboard. Location-verified attendance with **site geofencing, GPS-spoofing detection** and audit trails; live workforce tracking and CSV exports using OpenStreetMap — no paid map APIs.",
      technologies: [
        "React Native",
        "Android",
        "REST API",
        "Geofencing",
        "OpenStreetMap",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Prathmeshgumal/Verp",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
} as const;
