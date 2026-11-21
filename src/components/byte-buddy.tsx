"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Byte: a small pixel character that lives on the page.
 *
 * It starts in the bottom-left corner, then explores: climbs onto headings,
 * the avatar, project cards and the contact card (anything marked with
 * `data-byte-perch`), says the line in `data-byte-say` when it arrives,
 * walks along the top edge, types, reads, peeks over the edge and plants
 * little flags. It hops between nearby spots, floats down with an umbrella,
 * a parachute or a propeller cap when its spot scrolls away, runs to a
 * project card the visitor hovers, and can be picked up and thrown.
 * Clicking it makes it wave.
 *
 * For visitors who prefer reduced motion it stays in the corner and only
 * does small in-place moves. Hidden on small screens and on /admin.
 */

// ---------- Sprite ----------

const PX = 5; // screen pixels per sprite pixel
const COLS = 16;
const ROWS = 22;
const TOP = 6; // sprite rows start here, leaving headroom above the head
const CW = COLS * PX;
const CH = ROWS * PX;
const FEET = (TOP + 13) * PX; // y inside the canvas where the feet touch the ground
const HAND_Y = (TOP - 1) * PX; // y inside the canvas where Byte grips the rope

const C = {
  outline: "#3a2418",
  body: "#e8743b",
  light: "#f6a86f",
  visor: "#2a1a12",
  eye: "#7dd3fc",
  eyeDim: "#bae6fd",
  metal: "#9ca3af",
  hook: "#4b5563",
  red: "#ef4444",
  cream: "#fff1f0",
  yellow: "#fde68a",
  capBlue: "#3b82f6",
  capYellow: "#facc15",
  rotor: "#94a3b8",
  book: "#60a5fa",
  bookSpine: "#1d4ed8",
};

type Pose =
  | "walk" | "stand" | "look" | "type" | "read" | "sleep" | "sit"
  | "climb" | "dangle" | "fall" | "umbrella" | "hang" | "flap" | "point" | "hold";

type Look = { dir: 1 | -1; frame: 0 | 1; blink: boolean; ear: boolean; lookOff: number; wave: number };

function drawByte(ctx: CanvasRenderingContext2D, pose: Pose, d: Look) {
  const p = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x * PX, (y + TOP) * PX, w * PX, h * PX);
  };
  const { outline: K, body: O, light: L, visor: V, eye: E } = C;
  ctx.clearRect(0, 0, CW, CH);
  ctx.save();
  if (d.dir < 0) {
    ctx.translate(CW, 0);
    ctx.scale(-1, 1);
  }

  const sitting = pose === "type" || pose === "sleep" || pose === "read" || pose === "sit";
  const oy = sitting ? 2 : 0;
  const surprised = pose === "dangle" || pose === "fall" || pose === "hold";

  // Ears, body, visor
  p(4, 1 + oy - (d.ear ? 1 : 0), 2, 2, O);
  p(10, 1 + oy, 2, 2, O);
  p(3, 3 + oy, 10, 8 - oy, K);
  p(4, 3 + oy, 8, 8 - oy, O);
  p(4, 3 + oy, 8, 1, L);
  p(5, 5 + oy, 7, 3, V);

  // Eyes
  const lk = pose === "walk" || surprised ? 0 : d.lookOff;
  if (pose === "sleep") {
    p(6, 6 + oy, 2, 1, E);
    p(9, 6 + oy, 2, 1, E);
  } else if (surprised) {
    p(6, 5 + oy, 2, 2, E);
    p(9, 5 + oy, 2, 2, E);
  } else if (pose === "read") {
    p(7, 6 + oy, 1, 1, E);
    p(10, 6 + oy, 1, 1, E);
  } else if (d.blink) {
    p(7 + lk, 6 + oy, 1, 1, E);
    p(10 + lk, 6 + oy, 1, 1, E);
  } else {
    p(7 + lk, 5 + oy, 1, 2, E);
    p(10 + lk, 5 + oy, 1, 2, E);
  }
  p(5, 9, 2, 1, L); // chest badge

  const sitLegs = () => {
    p(4, 11, 3, 1, K);
    p(9, 11, 3, 1, K);
  };
  const standLegs = () => {
    p(5, 11, 2, 2, K);
    p(10, 11, 2, 2, K);
  };

  switch (pose) {
    case "type":
      p(10, 9, 5, 1, C.metal);
      p(13, 6, 1, 3, C.metal);
      p(14, 6, 1, 1, d.frame ? E : C.eyeDim);
      p(12, 8 + (d.frame ? 0 : 1), 1, 1, O);
      sitLegs();
      break;
    case "read":
      p(8, 7, 5, 3, C.book);
      p(10, 7, 1, 3, C.bookSpine);
      p(7, 9, 1, 1, O);
      p(13, 9, 1, 1, O);
      sitLegs();
      break;
    case "sleep":
      p(2, 9, 1, 2, O);
      p(13, 9, 1, 2, O);
      sitLegs();
      break;
    case "sit": // sitting on an edge, legs dangling over it
      p(2, 9, 1, 2, O);
      p(13, 9, 1, 2, O);
      p(5, 11, 2, 3, K);
      p(10, 11, 2, d.frame ? 4 : 3, K);
      break;
    case "climb": // hands on the rope above the head, one over the other
      p(6, (d.frame ? 0 : 2) - 2, 1, 3, O);
      p(9, (d.frame ? 2 : 0) - 2, 1, 3, O);
      p(5, 11, 2, d.frame ? 2 : 1, K);
      p(10, 11, 2, d.frame ? 1 : 2, K);
      break;
    case "dangle":
      p(2, 1, 1, 3, O);
      p(13, 1, 1, 3, O);
      p(5, 11, 2, 3, K);
      p(10, 11, 2, 3, K);
      break;
    case "fall":
      p(2, 1, 1, 3, O);
      p(13, 1, 1, 3, O);
      p(4, 11, 2, 2, K);
      p(11, 11, 2, 2, K);
      break;
    case "hold":
      p(2, 1, 1, 3, O);
      p(13, 1, 1, 3, O);
      standLegs();
      break;
    case "umbrella": // one hand up on the umbrella handle
      p(2, 7, 1, 2, O);
      p(13, 3, 1, 3, O);
      p(5, 11, 2, 3, K);
      p(10, 11, 2, 3, K);
      break;
    case "hang": // both hands up on the parachute lines
      p(2, 1, 1, 3, O);
      p(13, 1, 1, 3, O);
      p(5, 11, 2, 3, K);
      p(10, 11, 2, 3, K);
      break;
    case "flap": // arms out, flapping under the propeller
      p(1, 5 + (d.frame ? 0 : 2), 2, 1, O);
      p(13, 5 + (d.frame ? 0 : 2), 2, 1, O);
      p(5, 11, 2, 3, K);
      p(10, 11, 2, 3, K);
      break;
    case "point":
      p(2, 7, 1, 2, O);
      p(13, 7, 3, 1, O);
      standLegs();
      break;
    default: {
      p(2, 7, 1, 2, O);
      if (d.wave > 0) p(13, 4 + (Math.floor(d.wave * 8) % 2), 1, 3, O);
      else p(13, 7, 1, 2, O);
      if (pose === "walk" && d.frame) {
        p(5, 11, 2, 2, K);
        p(10, 11, 2, 1, K);
      } else if (pose === "walk") {
        p(5, 11, 2, 1, K);
        p(10, 11, 2, 2, K);
      } else standLegs();
    }
  }
  ctx.restore();
}

// ---------- Landing gear ----------
// Byte comes down with one of three, picked at random each time.

type Gear = "umbrella" | "parachute" | "propeller";
const GEARS: Gear[] = ["umbrella", "parachute", "propeller"];

// The gear canvas reaches 8 sprite columns left of Byte and 28 rows above it.
const GEAR_LEFT = 8;
const GEAR_UP = 28;
const GW = 32 * PX;
const GH = (GEAR_UP + 14) * PX;

const GEAR_INFO: Record<Gear, {
  fallSpeed: number; // px/s
  pivot: [number, number]; // sprite col/row the whole thing sways around
  sway: (t: number) => number; // radians
  drift: (t: number) => number; // sideways speed, px/s
  bob?: (t: number) => number;
  landTime: number; // seconds the landing animation lasts
}> = {
  umbrella: {
    fallSpeed: 70, pivot: [13, -6], landTime: 0.9,
    sway: (t) => Math.sin(t * 1.8) * 0.16, drift: (t) => Math.cos(t * 0.9) * 24,
  },
  parachute: {
    fallSpeed: 62, pivot: [8, -20], landTime: 1.1,
    sway: (t) => Math.sin(t * 1.4) * 0.22, drift: (t) => Math.cos(t * 0.7) * 16,
  },
  propeller: {
    fallSpeed: 58, pivot: [8, 6], landTime: 1.4,
    sway: (t) => Math.sin(t * 3) * 0.06, drift: (t) => Math.cos(t * 1.1) * 20,
    bob: (t) => Math.sin(t * 6) * 4,
  },
};

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/** Draw the gear. `land` is 0 while falling, then counts up in seconds after landing. */
function drawGear(ctx: CanvasRenderingContext2D, gear: Gear, land: number, rotor: number) {
  ctx.clearRect(0, 0, GW, GH);
  const ox = GEAR_LEFT * PX;
  const oy = GEAR_UP * PX;
  const p = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(ox + x * PX, oy + y * PX, w * PX, h * PX);
  };

  if (gear === "umbrella") {
    const close = easeOut(Math.min(1, land / 0.6));
    p(13, -8, 1, 11, C.hook); // shaft down to the hand
    const half = 11 * (1 - close * 0.82);
    const rows: [number, number][] = [[-14, 0.25], [-13, 0.55], [-12, 0.78], [-11, 0.92], [-10, 1]];
    rows.forEach(([y, w], i) => {
      const hw = Math.max(1, Math.round(half * w));
      for (let x = -hw; x < hw; x++) {
        const panel = Math.floor((x + 11) / 4) % 2;
        p(13 + x, y + Math.round(close * i * 0.9), 1, 1, panel ? C.cream : C.red);
      }
    });
    p(13, -15, 1, 1, C.hook); // tip
    if (close < 0.5) for (let x = -Math.round(half); x < Math.round(half); x += 4) p(14 + x, -9, 2, 1, C.red);
    return;
  }

  if (gear === "parachute") {
    const c = easeOut(Math.min(1, land / 0.9));
    ctx.globalAlpha = 1 - c * 0.9;
    const drop = c * 22;
    const squash = 1 - c * 0.65;
    const rows: [number, number][] = [[-26, 5], [-25, 9], [-24, 12], [-23, 13], [-22, 14], [-21, 14]];
    rows.forEach(([y, hw]) => {
      const w = Math.round(hw * (1 + c * 0.3));
      for (let x = -w; x < w; x++) {
        const stripe = Math.floor((x + 14) / 4) % 2;
        p(8 + x, Math.round(-21 + (y + 21) * squash + drop), 1, 1, stripe ? C.yellow : C.body);
      }
    });
    if (c < 0.4) {
      // Lines from the canopy edge down to Byte's raised hands.
      ctx.strokeStyle = C.hook;
      ctx.lineWidth = 1.5;
      const hands = [[2.5, 1], [13.5, 1]];
      [[-6, -20], [3, -20], [13, -20], [22, -20]].forEach(([x, y], i) => {
        const h = hands[i < 2 ? 0 : 1];
        ctx.beginPath();
        ctx.moveTo(ox + x * PX, oy + (y + drop) * PX);
        ctx.lineTo(ox + h[0] * PX, oy + h[1] * PX);
        ctx.stroke();
      });
    }
    ctx.globalAlpha = 1;
    return;
  }

  // Propeller cap: striped beanie with a spinning rotor on a stalk.
  p(4, 0, 8, 1, C.capBlue);
  p(5, -1, 6, 1, C.capYellow);
  p(6, -2, 4, 1, C.red);
  p(8, -4, 1, 2, C.hook);
  const w = Math.round(Math.abs(Math.cos(rotor)) * 7);
  p(8 - w, -5, w * 2 + 1, 1, C.rotor);
  p(8, -5, 1, 1, C.red);
}

// ---------- Behaviour ----------

const GRAVITY = 1100;
const NAP_AFTER_MS = 20_000;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

type Where = "floor" | "perch" | "climb" | "air" | "drag";
type Act = "walk" | "look" | "idle" | "type" | "read" | "peek" | "flag" | "say" | "sleep";

const FLAG_SVG =
  '<svg width="16" height="24" viewBox="0 0 4 6" shape-rendering="crispEdges" aria-hidden="true">' +
  `<rect x="0" y="0" width="1" height="6" fill="${C.outline}"/>` +
  `<rect x="1" y="0" width="3" height="1" fill="${C.body}"/>` +
  `<rect x="1" y="1" width="2" height="1" fill="${C.body}"/>` +
  `<rect x="1" y="2" width="1" height="1" fill="${C.light}"/></svg>`;

export default function ByteBuddy() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/admin");
  const fixedLayerRef = useRef<HTMLDivElement>(null);
  const absLayerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const zzRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLCanvasElement>(null);
  const ropePathRef = useRef<SVGPathElement>(null);
  const ropeStripeRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (hidden) return;
    const fixedLayer = fixedLayerRef.current;
    const absLayer = absLayerRef.current;
    const actor = actorRef.current;
    const canvas = canvasRef.current;
    const bubble = bubbleRef.current;
    const zz = zzRef.current;
    const ctx = canvas?.getContext("2d");
    const gearCanvas = gearRef.current;
    const gctx = gearCanvas?.getContext("2d");
    if (!gearCanvas || !gctx) return;
    if (!fixedLayer || !absLayer || !actor || !canvas || !bubble || !zz || !ctx || !ropeRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideEnough = window.matchMedia("(min-width: 640px)");

    const s = {
      where: "floor" as Where,
      x: 24,
      feet: window.innerHeight - 16,
      vx: 0,
      vy: 0,
      gear: null as Gear | null, // what Byte is floating down with, if anything
      lastGear: null as Gear | null,
      gearT: 0,
      gearLand: 0, // 0 while falling; counts up after landing while the gear packs away
      rotor: 0,
      dir: 1 as 1 | -1,
      frame: 0 as 0 | 1,
      frameT: 0,
      blink: 0,
      ear: 0,
      lookOff: 0,
      lookT: 0,
      wave: 0,
      hop: 0,
      hopV: 0,
      act: "walk" as Act,
      actT: 3,
      moving: false,
      atEdge: false,
      pointing: false,
      perch: null as HTMLElement | null,
      perchDx: 0,
      perchT: 0,
      stay: 12,
      lastPerch: null as HTMLElement | null,
      goal: null as HTMLElement | null,
      floorT: 0,
      zzT: 0,
      bubbleUntil: 0,
    };
    // The rope: thrown up before a climb, pulled up after it.
    const rope = {
      mode: "none" as "none" | "throw" | "climb" | "retract",
      t: 0,
      anchor: null as HTMLElement | null,
      startTop: 0,
      time: 0, // drives the sway
      amp: 0, // 0 while the rope is flying up, eases to 1 once it has caught
      top: 0,
      length: 0,
    };
    const ROPE_BOX = 80; // width of the box the swaying rope is drawn in
    // How far the rope is pushed sideways at `dy` pixels below the hook:
    // a slow pendulum swing plus a ripple running down the rope.
    // Both grow toward the free end, so the hook stays put.
    const ropeSway = (dy: number) => {
      const k = rope.length > 0 ? clamp(dy / rope.length, 0, 1) : 0;
      return rope.amp * k * (14 * Math.sin(rope.time * 1.7) + 5 * Math.sin(rope.time * 6 - dy * 0.045));
    };
    const saidAt = new WeakMap<Element, number>();
    const flagged = new WeakSet<Element>();
    let lastActivity = performance.now();
    let gearDrawn = false;
    let fastScrollUntil = 0;
    let lastWhoa = 0;
    let lastNearWave = 0;
    let nearSince = 0;
    let lastGoalAt = 0;
    const pointer = { x: -9999, y: -9999, inside: false };
    let hovered: HTMLElement | null = null;
    let hoveredSince = 0;

    const floorY = () => window.innerHeight - 16;
    const perches = () => Array.from(document.querySelectorAll<HTMLElement>("[data-byte-perch]"));
    const laneEnd = () => {
      const dock = document.querySelector("[data-dock-lane]")?.firstElementChild;
      const right = dock ? dock.getBoundingClientRect().left : window.innerWidth / 2;
      return right - 24 - CW;
    };
    const ROPE_INSET = 3; // the rope hangs this far left of the spot's edge
    const climbX = (r: DOMRect) => r.left - ROPE_INSET - CW / 2;
    const usable = (r: DOMRect) => r.width >= 50 && r.top > 120 && r.top < floorY() - 70;

    function say(text: string, ms = 2200) {
      bubble!.textContent = text;
      bubble!.style.opacity = "1";
      s.bubbleUntil = performance.now() + ms;
    }

    function hopInPlace() {
      if (s.hop === 0 && !reduceMotion.matches) {
        s.hop = -0.001;
        s.hopV = -250;
      }
    }

    function setAct(act: Act, t: number) {
      s.act = act;
      s.actT = t;
      s.atEdge = false;
      s.pointing = false;
    }

    // Plant a small flag on the current spot. It fades away after a while.
    function plantFlag(r: DOMRect) {
      const flag = document.createElement("div");
      flag.innerHTML = FLAG_SVG;
      flag.style.cssText = "position:absolute;pointer-events:none;transition:opacity 1s";
      flag.style.left = `${r.left + window.scrollX + s.perchDx + CW / 2 + s.dir * 22}px`;
      flag.style.top = `${r.top + window.scrollY - 24}px`;
      absLayer!.appendChild(flag);
      setTimeout(() => (flag.style.opacity = "0"), 18_000);
      setTimeout(() => flag.remove(), 19_200);
    }

    function startGear() {
      const options = GEARS.filter((g) => g !== s.lastGear);
      s.gear = pick(options);
      s.lastGear = s.gear;
      s.gearT = 0;
      s.gearLand = 0;
    }
    // Landed: let the gear play its landing animation, then put it away.
    function touchDown() {
      if (s.gear && s.gearLand === 0) s.gearLand = 0.0001;
    }

    function land(el: HTMLElement, r: DOMRect) {
      s.where = "perch";
      s.perch = el;
      s.perchDx = clamp(s.x - r.left, -12, r.width - CW + 12);
      s.perchT = 0;
      s.stay = rand(9, 15);
      s.vx = s.vy = 0;
      touchDown();
      if (s.goal === el) s.goal = null;
      const line = el.dataset.byteSay;
      const last = saidAt.get(el) ?? -Infinity;
      if (line && performance.now() - last > 25_000) {
        saidAt.set(el, performance.now());
        setAct("say", 2.6);
        s.pointing = el.hasAttribute("data-byte-point");
        if (s.pointing) s.dir = 1;
        say(line, 2600);
      } else setAct("look", 1);
    }

    function jumpTo(r: DOMRect) {
      const lx = clamp(s.x, r.left - 6, r.right - CW + 6) + rand(-20, 20);
      const dy = r.top - s.feet;
      const T = 0.65 + Math.min(0.5, Math.abs(lx - s.x) / 1400);
      s.vx = (lx - s.x) / T;
      s.vy = (dy - 0.5 * GRAVITY * T * T) / T;
      s.dir = s.vx >= 0 ? 1 : -1;
      s.where = "air";
      s.gear = null;
    }

    function leavePerch() {
      const from = s.perch;
      s.lastPerch = from;
      s.perch = null;
      const options = perches()
        .filter((el) => el !== from)
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => {
          if (!usable(r)) return false;
          const dx = r.left + r.width / 2 - (s.x + CW / 2);
          const dy = r.top - s.feet;
          return Math.abs(dx) < 560 && dy > -280 && dy < 380;
        });
      const goal = options.find((o) => o.el === s.goal);
      const target = goal ?? (Math.random() < 0.65 ? pick(options) : undefined);
      if (target) {
        jumpTo(target.r);
        return;
      }
      // Nowhere to hop to: jump down to the floor.
      s.where = "air";
      s.vx = s.x > laneEnd() ? -160 : rand(-90, 90);
      s.vy = -220;
      s.dir = s.vx >= 0 ? 1 : -1;
    }

    function pickFloorGoal(): HTMLElement | null {
      const maxX = window.innerWidth - 300 - CW;
      const options = perches()
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ el, r }) => el !== s.lastPerch && usable(r) && climbX(r) > 8 && climbX(r) < maxX);
      if (!options.length) return null;
      const weighted = options.flatMap((o) =>
        o.el.hasAttribute("data-byte-point") ? [o, o, o] : o.el.hasAttribute("data-byte-card") ? [o, o] : [o]
      );
      return pick(weighted).el;
    }

    // ---------- Input ----------

    const onActivity = () => {
      lastActivity = performance.now();
      if (s.act === "sleep") setAct("idle", 0.6);
    };
    const onPointerMove = (e: PointerEvent) => {
      onActivity();
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      const card = (e.target as Element | null)?.closest?.<HTMLElement>("[data-byte-card]") ?? null;
      if (card !== hovered) {
        hovered = card;
        hoveredSince = performance.now();
      }
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      hovered = null;
    };
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    const onScroll = () => {
      onActivity();
      const now = performance.now();
      const v = Math.abs(window.scrollY - lastScrollY) / Math.max(1, now - lastScrollT);
      lastScrollY = window.scrollY;
      lastScrollT = now;
      if (v > 2.5 && s.where === "perch") {
        fastScrollUntil = now + 350;
        if (now - lastWhoa > 9000) {
          lastWhoa = now;
          say("whoa!", 1200);
        }
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onActivity);

    // Click to say hi; press and drag to pick Byte up and throw it.
    const drag = { down: false, dragging: false, sx: 0, sy: 0, gx: 0, gy: 0, lx: 0, ly: 0, lt: 0, vx: 0, vy: 0 };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      onActivity();
      Object.assign(drag, {
        down: true, dragging: false, sx: e.clientX, sy: e.clientY,
        gx: e.clientX - s.x, gy: e.clientY - (s.feet - FEET),
        lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0,
      });
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.down) return;
      const now = performance.now();
      const dt = Math.max(1, now - drag.lt) / 1000;
      drag.vx = (e.clientX - drag.lx) / dt;
      drag.vy = (e.clientY - drag.ly) / dt;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      drag.lt = now;
      if (!drag.dragging && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6 && !reduceMotion.matches) {
        drag.dragging = true;
        s.where = "drag";
        s.gear = null;
        s.perch = null;
        s.goal = null;
        setAct("idle", 1);
        say("hey!", 900);
      }
    };
    const onUp = () => {
      if (!drag.down) return;
      drag.down = false;
      if (drag.dragging) {
        s.where = "air";
        s.vx = clamp(drag.vx * 0.5, -900, 900);
        s.vy = clamp(drag.vy * 0.5, -900, 900);
        if (Math.hypot(s.vx, s.vy) > 400) say("wheee!", 1200);
        return;
      }
      // A plain click
      setAct("idle", 1.4);
      s.wave = 1.2;
      hopInPlace();
      say(pick(["hi!", "hello!", "👋", "beep boop"]), 1300);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    // ---------- Update ----------

    function updateFloor(dt: number, now: number) {
      s.feet = floorY();
      s.floorT += dt;
      const end = laneEnd();
      if (s.act === "sleep") return;

      if (s.goal) {
        const r = s.goal.getBoundingClientRect();
        if (!usable(r)) {
          s.goal = null;
          return;
        }
        const tx = climbX(r);
        const dx = tx - s.x;
        s.dir = dx >= 0 ? 1 : -1;
        s.moving = Math.abs(dx) > 2;
        s.x += Math.sign(dx) * Math.min(Math.abs(dx), 75 * dt);
        if (!s.moving) {
          s.where = "climb";
          s.dir = 1;
          Object.assign(rope, { mode: "throw", t: 0, anchor: s.goal, startTop: s.feet - FEET + 10, amp: 0, time: 0 });
        }
        return;
      }

      s.actT -= dt;
      if (s.act === "walk") {
        s.moving = true;
        s.x += s.dir * 36 * dt;
        if (s.x < 20) { s.x = 20; s.dir = 1; }
        if (s.x > end && s.dir > 0) s.dir = -1;
      } else if (s.x > end + 4) {
        // Landed somewhere outside the corner: walk back first.
        setAct("walk", 2);
        s.dir = -1;
      }
      if (s.actT <= 0) {
        if (s.floorT > 4 && now - lastGoalAt > 3000 && Math.random() < 0.7) {
          const goal = pickFloorGoal();
          if (goal) {
            s.goal = goal;
            lastGoalAt = now;
            setAct("walk", 1);
            return;
          }
        }
        const r = Math.random();
        if (s.act !== "walk") setAct("walk", rand(2, 4));
        else setAct(r < 0.35 ? "type" : r < 0.7 ? "look" : "idle", r < 0.35 ? rand(2.5, 4) : rand(1, 2));
        if (s.act === "walk" && Math.random() < 0.4) s.dir = s.dir === 1 ? -1 : 1;
      }
    }

    function updatePerch(dt: number, now: number) {
      const el = s.perch!;
      if (!el.isConnected) {
        s.where = "air";
        s.perch = null;
        return;
      }
      const r = el.getBoundingClientRect();
      s.x = r.left + s.perchDx;
      s.feet = r.top;
      if (r.top < 70) {
        // Spot scrolled off the top: float down with an umbrella, parachute or propeller cap.
        s.perch = null;
        s.where = "air";
        startGear();
        s.vx = 0;
        s.vy = 0;
        return;
      }
      if (r.top > floorY()) {
        // Spot moved below the bottom of the screen: step onto the floor.
        s.perch = null;
        s.where = "floor";
        s.floorT = 0;
        setAct("look", 1);
        return;
      }
      s.perchT += dt;
      if (s.act === "sleep") return;

      // A visitor hovered a project card for a moment: go and look at it.
      if (hovered && hovered !== el && now - hoveredSince > 900 && now - lastGoalAt > 6000 && s.act !== "say") {
        if (usable(hovered.getBoundingClientRect())) {
          s.goal = hovered;
          lastGoalAt = now;
          say("ooh, that one!", 1300);
          leavePerch();
          return;
        }
      }

      const minDx = -12;
      const maxDx = Math.max(minDx, r.width - CW + 12);
      s.actT -= dt;
      if (s.act === "walk") {
        s.moving = true;
        s.perchDx += s.dir * 36 * dt;
        if (s.perchDx < minDx) { s.perchDx = minDx; s.dir = 1; }
        if (s.perchDx > maxDx) { s.perchDx = maxDx; s.dir = -1; }
      } else if (s.act === "peek" && !s.atEdge) {
        const leftEdge = s.perchDx < (minDx + maxDx) / 2;
        const target = leftEdge ? minDx - 14 : maxDx + 14;
        const dx = target - s.perchDx;
        s.dir = dx >= 0 ? 1 : -1;
        s.moving = Math.abs(dx) > 2;
        s.perchDx += Math.sign(dx) * Math.min(Math.abs(dx), 36 * dt);
        if (!s.moving) {
          s.atEdge = true;
          s.dir = leftEdge ? -1 : 1;
          s.actT = rand(2.5, 4);
        }
        return;
      }

      if (s.actT > 0) return;
      if (s.atEdge) s.perchDx = clamp(s.perchDx, minDx, maxDx);
      if (s.perchT > s.stay) {
        leavePerch();
        return;
      }
      const roomy = r.width >= 140;
      const options: Act[] = ["walk", "walk", "look", "type", "read", "idle"];
      if (roomy) options.push("peek");
      if (roomy && !flagged.has(el)) options.push("flag", "flag");
      const next = s.act === "walk" ? pick(options.filter((a) => a !== "walk")) : pick(options);
      if (next === "flag") {
        flagged.add(el);
        setAct("flag", 1);
        s.wave = 0.8;
        plantFlag(r);
        if (Math.random() < 0.5) say(pick(["mine!", "I was here", "📍"]), 1400);
        return;
      }
      setAct(next, next === "walk" ? rand(1.5, 3.5) : next === "type" || next === "read" ? rand(2.5, 4) : next === "peek" ? 99 : rand(1, 2));
    }

    function updateAir(dt: number) {
      s.vy += GRAVITY * dt;
      const gear = s.gear && s.gearLand === 0 ? GEAR_INFO[s.gear] : null;
      if (gear) {
        s.vy = Math.min(s.vy, gear.fallSpeed);
        s.vx = gear.drift(s.gearT);
      }
      const prevFeet = s.feet;
      s.x += s.vx * dt;
      s.feet += s.vy * dt;
      if (s.x < 0) { s.x = 0; s.vx = -s.vx * 0.5; }
      if (s.x > window.innerWidth - CW) { s.x = window.innerWidth - CW; s.vx = -s.vx * 0.5; }
      if (Math.abs(s.vx) > 5 && !gear) s.dir = s.vx > 0 ? 1 : -1;
      if (s.vy > 0) {
        const cx = s.x + CW / 2;
        for (const el of perches()) {
          const r = el.getBoundingClientRect();
          if (r.width < 40 || r.top < 80 || r.top > floorY() - 30) continue;
          if (prevFeet <= r.top + 2 && s.feet >= r.top && cx >= r.left - 10 && cx <= r.right + 10) {
            s.x = clamp(s.x, r.left - 12, r.right - CW + 12);
            land(el, r);
            return;
          }
        }
      }
      if (s.feet >= floorY()) {
        const hard = s.vy > 750;
        s.feet = floorY();
        s.where = "floor";
        s.floorT = 0;
        s.vx = s.vy = 0;
        touchDown();
        setAct("look", 1);
        if (hard) say("oof", 900);
      }
    }

    function updateClimb(dt: number) {
      const el = s.goal;
      const r = el?.getBoundingClientRect();
      if (!el || !r || r.top < 40 || r.top > floorY()) {
        s.goal = null;
        s.where = "air";
        s.vx = 0;
        s.vy = 0;
        rope.mode = "none";
        return;
      }
      s.x = climbX(r);
      s.dir = 1;
      if (rope.mode === "throw") {
        // Rope flies up and the hook catches the edge, then the climb starts.
        if (rope.t >= 1) rope.mode = "climb";
        return;
      }
      s.feet -= 95 * dt;
      if (s.feet <= r.top) {
        // Reached the top: pull up, hop over the edge and reel the rope in.
        s.feet = r.top;
        s.where = "air";
        s.vx = 140;
        s.vy = -230;
        rope.mode = "retract";
        rope.t = 0;
      }
    }

    // ---------- Render ----------

    function poseFor(now: number): Pose {
      if (s.where === "drag") return "dangle";
      if (s.where === "air" && s.gear) return s.gear === "umbrella" ? "umbrella" : s.gear === "parachute" ? "hang" : "flap";
      if (s.where === "air") return s.vy < -150 ? "climb" : "fall";
      if (s.gear === "umbrella" && s.gearLand < 0.6) return "umbrella";
      if (s.where === "climb") return rope.mode === "throw" ? "hold" : "climb";
      if (s.where === "perch" && now < fastScrollUntil) return "hold";
      switch (s.act) {
        case "walk": return s.moving ? "walk" : "stand";
        case "look": return "look";
        case "type": return "type";
        case "read": return "read";
        case "sleep": return "sleep";
        case "peek": return s.atEdge ? "sit" : s.moving ? "walk" : "stand";
        case "say": return s.pointing ? "point" : "stand";
        default: return "stand";
      }
    }

    function renderRope(dt: number) {
      const el = ropeRef.current!;
      // Picked up or knocked off mid-climb: reel the rope in.
      if ((rope.mode === "throw" || rope.mode === "climb") && s.where !== "climb") {
        rope.mode = "retract";
        rope.t = 0;
      }
      const r = rope.anchor?.getBoundingClientRect();
      if (rope.mode === "none" || !r) {
        el.style.opacity = "0";
        return;
      }
      rope.t += dt / (rope.mode === "throw" ? 0.45 : 0.4);
      rope.time += dt;
      rope.amp = rope.mode === "throw" ? 0 : Math.min(1, rope.amp + dt * 2);
      const t = Math.min(1, rope.t);
      const bottom = floorY() - 4;
      let top = r.top;
      let end = bottom;
      if (rope.mode === "throw") top = rope.startTop + (r.top - rope.startTop) * (1 - (1 - t) * (1 - t));
      if (rope.mode === "retract") {
        end = bottom + (r.top - bottom) * t;
        if (t >= 1) rope.mode = "none";
      }
      rope.top = top;
      rope.length = Math.max(0, end - top);
      const height = Math.max(0, Math.round(end - top + 8));
      el.style.opacity = "1";
      el.style.transform = `translate(${Math.round(r.left - ROPE_INSET - ROPE_BOX / 2)}px, ${Math.round(top - 8)}px)`;
      el.style.height = `${height}px`;

      // Redraw the rope as a curve through points every 8px.
      const mid = ROPE_BOX / 2;
      let d = `M ${mid} 8`;
      for (let y = 8; y <= rope.length; y += 8) d += ` L ${(mid + ropeSway(y)).toFixed(1)} ${y + 8}`;
      d += ` L ${(mid + ropeSway(rope.length)).toFixed(1)} ${height}`;
      ropePathRef.current!.setAttribute("d", d);
      ropeStripeRef.current!.setAttribute("d", d);
    }

    function render(now: number, dt: number) {
      renderRope(dt);
      const pose = poseFor(now);
      const onPerch = s.where === "perch";
      const layer = onPerch ? absLayer! : fixedLayer!;
      if (actor!.parentElement !== layer) layer.appendChild(actor!);

      const bob = pose === "walk" || pose === "climb" ? (s.frame ? -2 : 0) : pose === "sleep" ? (s.frame ? 1 : 0) : 0;
      const top = s.feet - FEET + s.hop + (reduceMotion.matches ? 0 : bob);
      const x = onPerch ? s.x + window.scrollX : s.x;
      const y = onPerch ? top + window.scrollY : top;
      let swingX = 0;
      let tilt = 0;
      if (s.where === "climb" && rope.mode === "climb") {
        // Hang from the hands: follow the rope sideways and lean with its slope.
        const handY = top + HAND_Y - rope.top;
        swingX = ropeSway(handY);
        tilt = (Math.atan2(ropeSway(handY + 6) - ropeSway(handY - 6), 12) * 180) / Math.PI;
      }
      let origin = `${CW / 2}px ${HAND_Y}px`;
      if (!s.gear && gearDrawn) {
        gctx!.clearRect(0, 0, GW, GH);
        gearDrawn = false;
      }
      let bobY = 0;
      if (s.gear) {
        const info = GEAR_INFO[s.gear];
        const falling = s.gearLand === 0;
        const calm = falling ? 1 : Math.max(0, 1 - s.gearLand / 0.5);
        s.gearT += dt;
        if (!falling) s.gearLand += dt;
        const spin = falling ? 1 : Math.max(0, 1 - s.gearLand / info.landTime);
        s.rotor += spin * 0.55;
        tilt = (-info.sway(s.gearT) * calm * 180) / Math.PI;
        if (falling && info.bob) bobY = info.bob(s.gearT);
        // The sprite is mirrored when facing left, so mirror the pivot too.
        const col = s.dir < 0 ? COLS - info.pivot[0] : info.pivot[0];
        origin = `${col * PX}px ${(TOP + info.pivot[1]) * PX}px`;
        gearCanvas!.style.transform = s.dir < 0 ? "scaleX(-1)" : "";
        drawGear(gctx!, s.gear, s.gearLand, s.rotor);
        gearDrawn = true;
        if (!falling && s.gearLand > info.landTime) {
          s.gear = null;
          gctx!.clearRect(0, 0, GW, GH);
        }
      }
      actor!.style.transformOrigin = origin;
      actor!.style.transform = `translate(${Math.round(x + swingX)}px, ${Math.round(y + bobY)}px) rotate(${(-tilt).toFixed(1)}deg)`;

      if (now > s.bubbleUntil) bubble!.style.opacity = "0";
      if (pose === "sleep") {
        zz!.style.opacity = String(s.zzT < 1.6 ? 1 - s.zzT / 1.6 : 0);
        zz!.textContent = s.zzT < 0.7 ? "z" : "z z";
        zz!.style.transform = `translate(${s.zzT * 8}px, ${-s.zzT * 18}px)`;
      } else zz!.style.opacity = "0";

      drawByte(ctx!, pose, {
        dir: s.dir,
        frame: s.frame,
        blink: s.blink > 0,
        ear: s.ear > 0,
        lookOff: s.lookOff,
        wave: s.wave,
      });
    }

    function step(dt: number, now: number) {
      // Small timers that run in every state.
      s.frameT += dt;
      const frameLen = s.act === "type" ? 0.1 : s.act === "sleep" ? 0.8 : s.where === "climb" ? 0.15 : 0.2;
      if (s.frameT > frameLen) { s.frameT = 0; s.frame = s.frame ? 0 : 1; }
      s.blink = s.blink > 0 ? s.blink - dt : Math.random() < dt * 0.4 ? 0.14 : 0;
      s.ear = s.ear > 0 ? s.ear - dt : Math.random() < dt * (s.act === "sleep" ? 0.1 : 0.5) ? 0.15 : 0;
      s.wave = Math.max(0, s.wave - dt);
      if (s.hop !== 0) {
        s.hopV += 900 * dt;
        s.hop += s.hopV * dt;
        if (s.hop >= 0) { s.hop = 0; s.hopV = 0; }
      }
      if (s.act === "sleep") s.zzT = (s.zzT + dt) % 2;
      s.moving = false;

      // Eyes follow the cursor when it is close; a lingering cursor gets a wave.
      const cx = s.x + CW / 2;
      const cy = s.feet - FEET / 2;
      const near = pointer.inside && Math.hypot(pointer.x - cx, pointer.y - cy) < 170;
      if (near && s.act !== "walk" && s.act !== "sleep") {
        s.lookOff = (pointer.x > cx ? 1 : -1) * s.dir;
        if (!nearSince) nearSince = now;
        if (now - nearSince > 1800 && now - lastNearWave > 12_000 && (s.where === "floor" || s.where === "perch")) {
          lastNearWave = now;
          s.wave = 1.2;
          say(pick(["hi there!", "need something?", "hey 👀"]), 1500);
        }
      } else {
        nearSince = 0;
        if (s.act === "look") {
          s.lookT += dt;
          if (s.lookT > 0.7) { s.lookT = 0; s.lookOff = s.lookOff === 1 ? -1 : 1; }
        } else s.lookOff = 0;
      }

      if (reduceMotion.matches) {
        // Stay in the corner, only small in-place moves.
        s.where = "floor";
        s.perch = null;
        s.goal = null;
        s.x = 24;
        s.feet = floorY();
        s.actT -= dt;
        if (s.act === "walk" || (s.actT <= 0 && s.act !== "sleep")) {
          const r = Math.random();
          setAct(r < 0.35 ? "type" : r < 0.6 ? "read" : r < 0.85 ? "look" : "idle", rand(2, 4));
        }
      } else {
        if (s.act !== "sleep" && now - lastActivity > NAP_AFTER_MS && (s.where === "floor" || s.where === "perch")) {
          setAct("sleep", 99);
          s.goal = null;
        }
        if (s.where === "floor") updateFloor(dt, now);
        else if (s.where === "perch") updatePerch(dt, now);
        else if (s.where === "air") updateAir(dt);
        else if (s.where === "climb") updateClimb(dt);
        else if (s.where === "drag") {
          s.x = drag.lx - drag.gx;
          s.feet = drag.ly - drag.gy + FEET;
        }
        // On the floor, a visitor hovering a card also sends Byte over.
        if (s.where === "floor" && !s.goal && hovered && s.act !== "sleep" && now - hoveredSince > 900 && now - lastGoalAt > 6000) {
          const r = hovered.getBoundingClientRect();
          if (usable(r) && climbX(r) > 8) {
            s.goal = hovered;
            lastGoalAt = now;
            say("ooh, that one!", 1300);
          }
        }
      }
      render(now, dt);
    }

    // Say hello shortly after the page loads.
    const helloTimer = setTimeout(() => {
      s.wave = 1.4;
      say("hi! I'm Byte", 2200);
    }, 1200);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (wideEnough.matches) step(dt, now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(helloTimer);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onActivity);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <>
      {/* Byte moves between these two layers: fixed while on the floor or
          in the air, and scrolling with the page while standing on a spot. */}
      <div ref={fixedLayerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 hidden sm:block">
        <div ref={ropeRef} className="absolute left-0 top-0 opacity-0" style={{ width: 80, height: 0 }}>
          <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <path ref={ropePathRef} fill="none" stroke="#a16207" strokeWidth="4" strokeLinejoin="round" />
            <path
              ref={ropeStripeRef}
              fill="none"
              stroke="#ca8a04"
              strokeWidth="4"
              strokeDasharray="5 5"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            className="absolute top-0"
            style={{ left: 38 }}
            width="16"
            height="12"
            viewBox="0 0 8 6"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="0" y="0" width="7" height="1" fill={C.hook} />
            <rect x="6" y="1" width="2" height="1" fill={C.hook} />
            <rect x="7" y="2" width="1" height="2" fill={C.hook} />
            <rect x="0" y="1" width="2" height="5" fill={C.hook} />
          </svg>
        </div>
        <div
          ref={actorRef}
          className="absolute left-0 top-0"
          style={{ width: CW, height: CH }}
        >
          <div
            ref={bubbleRef}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 font-mono text-xs font-bold text-background opacity-0 shadow-sm transition-opacity"
            style={{ bottom: CH - (TOP + 1) * PX + 4 }}
          />
          <div
            ref={zzRef}
            className="absolute font-mono text-sm font-bold text-muted-foreground opacity-0"
            style={{ left: CW - 16, top: (TOP + 1) * PX }}
          >
            z
          </div>
          <canvas
            ref={gearRef}
            width={GW}
            height={GH}
            className="pointer-events-none absolute [image-rendering:pixelated]"
            style={{ left: -GEAR_LEFT * PX, top: (TOP - GEAR_UP) * PX, transformOrigin: `${GEAR_LEFT * PX + CW / 2}px 0` }}
          />
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="pointer-events-auto absolute left-0 top-0 cursor-grab touch-none select-none active:cursor-grabbing [image-rendering:pixelated]"
          />
        </div>
      </div>
      <div ref={absLayerRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20 hidden h-0 w-0 sm:block" />
    </>
  );
}
