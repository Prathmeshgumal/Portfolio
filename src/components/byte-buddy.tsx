"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Byte: a small pixel character that wanders along the bottom-left of the
 * screen, between the left edge and the dock. Drawn on a canvas, no libraries.
 *
 * Moves: walk, look around, blink & ear twitch, type on a laptop,
 * say hi (on click) and nap (after 20s without any visitor activity).
 * For visitors who prefer reduced motion it stays in place (no walking or
 * hopping) but still blinks, looks around, types and naps. It is hidden
 * on small screens and on /admin.
 */

const PX = 5; // screen pixels per sprite pixel
const W = 16;
const H = 14;
const NAP_AFTER_MS = 20_000;

type Mode = "walk" | "look" | "idle" | "type" | "sleep";

type State = {
  x: number;
  dir: 1 | -1;
  mode: Mode;
  modeTime: number;
  frame: 0 | 1;
  frameTime: number;
  hop: number;
  vy: number;
  wave: number;
  ear: number;
  blink: number;
  lookOff: number;
  lookTime: number;
  zzTime: number;
  still: boolean;
};

const COLORS = {
  outline: "#3a2418",
  body: "#e8743b",
  light: "#f6a86f",
  visor: "#2a1a12",
  eye: "#7dd3fc",
  eyeDim: "#bae6fd",
  laptop: "#9ca3af",
};

function drawByte(ctx: CanvasRenderingContext2D, s: State) {
  const px = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
  };
  const { outline: K, body: O, light: L, visor: V, eye: C, laptop: G } = COLORS;

  ctx.clearRect(0, 0, W * PX, H * PX);
  ctx.save();
  if (s.dir < 0) {
    ctx.translate(W * PX, 0);
    ctx.scale(-1, 1);
  }

  const sitting = s.mode === "type" || s.mode === "sleep";
  const oy = sitting ? 2 : 0;

  // Ears, then body with a lighter top edge, then visor.
  px(4, 1 + oy - (s.ear > 0 ? 1 : 0), 2, 2, O);
  px(10, 1 + oy, 2, 2, O);
  px(3, 3 + oy, 10, 8 - oy, K);
  px(4, 3 + oy, 8, 8 - oy, O);
  px(4, 3 + oy, 8, 1, L);
  px(5, 5 + oy, 7, 3, V);

  // Eyes
  const look = s.mode === "look" ? s.lookOff : 0;
  if (s.mode === "sleep") {
    px(6, 6 + oy, 2, 1, C);
    px(9, 6 + oy, 2, 1, C);
  } else if (s.blink > 0) {
    px(7 + look, 6 + oy, 1, 1, C);
    px(10 + look, 6 + oy, 1, 1, C);
  } else {
    px(7 + look, 5 + oy, 1, 2, C);
    px(10 + look, 5 + oy, 1, 2, C);
  }
  px(5, 9, 2, 1, L); // chest badge

  if (s.mode === "type") {
    px(10, 9, 5, 1, G);
    px(13, 6, 1, 3, G);
    px(14, 6, 1, 1, s.frame ? C : COLORS.eyeDim);
    px(12, 8 + (s.frame ? 0 : 1), 1, 1, O);
    px(4, 11, 3, 1, K);
    px(9, 11, 3, 1, K);
  } else if (s.mode === "sleep") {
    px(2, 9, 1, 2, O);
    px(13, 9, 1, 2, O);
    px(4, 11, 3, 1, K);
    px(9, 11, 3, 1, K);
  } else {
    px(2, 7, 1, 2, O);
    if (s.wave > 0) px(13, 4 + (Math.floor(s.wave * 8) % 2), 1, 3, O);
    else px(13, 7, 1, 2, O);
    const walking = s.mode === "walk" && s.hop === 0 && !s.still;
    if (walking && s.frame) {
      px(5, 11, 2, 2, K);
      px(10, 11, 2, 1, K);
    } else if (walking) {
      px(5, 11, 2, 1, K);
      px(10, 11, 2, 2, K);
    } else {
      px(5, 11, 2, 2, K);
      px(10, 11, 2, 2, K);
    }
  }
  ctx.restore();
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function ByteBuddy() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/admin");
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const zzRef = useRef<HTMLDivElement>(null);
  const sayHiRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (hidden) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const bubble = bubbleRef.current;
    const zz = zzRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !bubble || !zz || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const s: State = {
      x: 24, dir: 1, mode: "walk", modeTime: rand(2.5, 5), frame: 0, frameTime: 0,
      hop: 0, vy: 0, wave: 0, ear: 0, blink: 0, lookOff: 0, lookTime: 0, zzTime: 0, still: reduceMotion.matches,
    };
    let lastActivity = performance.now();
    let bubbleTimer: ReturnType<typeof setTimeout> | undefined;

    // Byte's walking lane: from the left edge up to just before the dock.
    const laneEnd = () => {
      const dock = document.querySelector("[data-dock-lane]")?.firstElementChild;
      const right = dock ? dock.getBoundingClientRect().left : window.innerWidth / 2;
      return right - 24 - W * PX;
    };
    const laneStart = 20;

    const onActivity = () => {
      lastActivity = performance.now();
      if (s.mode === "sleep") {
        s.mode = "idle";
        s.modeTime = 0.6;
      }
    };
    const events = ["pointermove", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    sayHiRef.current = () => {
      onActivity();
      if (s.hop === 0 && !reduceMotion.matches) {
        s.vy = -250;
        s.hop = -0.001;
      }
      s.mode = "idle";
      s.modeTime = 1.4;
      s.wave = 1.2;
      bubble.style.opacity = "1";
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => (bubble.style.opacity = "0"), 1200);
    };

    const nextMode = () => {
      // Reduced motion: Byte stays in place and only does small moves.
      if (s.mode !== "walk" && !reduceMotion.matches) {
        s.mode = "walk";
        s.lookOff = 0;
        s.modeTime = rand(2.5, 5);
        if (Math.random() < 0.4) s.dir = s.dir === 1 ? -1 : 1;
        return;
      }
      const r = Math.random();
      s.mode = r < 0.4 ? "type" : r < 0.75 ? "look" : "idle";
      s.modeTime = s.mode === "type" ? rand(2.5, 4) : s.mode === "look" ? rand(1.6, 2.4) : rand(1, 1.8);
    };

    const render = () => {
      const still = reduceMotion.matches;
      const bob = still ? 0 : s.mode === "walk" && s.hop === 0 ? (s.frame ? -2 : 0) : s.mode === "sleep" ? (s.frame ? 1 : 0) : 0;
      const y = s.hop + bob;
      canvas.style.transform = `translate(${s.x}px, ${y}px)`;
      bubble.style.transform = `translate(${s.x + (W * PX) / 2 - 14}px, ${y - 28}px)`;
      if (s.mode === "sleep") {
        zz.style.opacity = String(s.zzTime < 1.6 ? 1 - s.zzTime / 1.6 : 0);
        zz.textContent = s.zzTime < 0.7 ? "z" : "z z";
        zz.style.transform = `translate(${s.x + W * PX - 18 + s.zzTime * 8}px, ${y + 4 - s.zzTime * 18}px)`;
      } else {
        zz.style.opacity = "0";
      }
      drawByte(ctx, s);
    };

    const step = (dt: number) => {
      s.still = reduceMotion.matches;
      const end = laneEnd();
      // Not enough room next to the dock: keep Byte out of the way.
      root.style.visibility = end - laneStart < 120 ? "hidden" : "visible";

      if (s.hop !== 0) {
        s.vy += 900 * dt;
        s.hop += s.vy * dt;
        if (s.hop >= 0) { s.hop = 0; s.vy = 0; }
      }
      s.wave = Math.max(0, s.wave - dt);

      if (s.mode !== "sleep" && performance.now() - lastActivity > NAP_AFTER_MS) {
        s.mode = "sleep";
        s.zzTime = 0;
      }
      if (s.mode === "sleep") {
        s.zzTime = (s.zzTime + dt) % 2;
      } else {
        s.modeTime -= dt;
        if (s.modeTime <= 0) nextMode();
      }

      if (s.mode === "look") {
        s.lookTime += dt;
        if (s.lookTime > 0.7) { s.lookTime = 0; s.lookOff = s.lookOff === 1 ? -1 : 1; }
      }
      if (s.mode === "walk" && !reduceMotion.matches) {
        s.x += s.dir * 36 * dt;
        if (s.x < laneStart) { s.x = laneStart; s.dir = 1; }
        if (s.x > end) { s.x = end; s.dir = -1; }
      } else {
        s.x = Math.min(Math.max(s.x, laneStart), Math.max(laneStart, end));
      }

      s.frameTime += dt;
      const frameLen = s.mode === "type" ? 0.1 : s.mode === "sleep" ? 0.8 : 0.2;
      if (s.frameTime > frameLen) { s.frameTime = 0; s.frame = s.frame ? 0 : 1; }
      s.ear = s.ear > 0 ? s.ear - dt : Math.random() < dt * (s.mode === "sleep" ? 0.1 : 0.5) ? 0.15 : 0;
      s.blink = s.blink > 0 ? s.blink - dt : Math.random() < dt * 0.4 ? 0.14 : 0;
      render();
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      step(Math.min(0.05, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bubbleTimer);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed bottom-4 left-0 z-20 hidden h-[70px] w-full sm:block"
    >
      <div
        ref={bubbleRef}
        className="absolute left-0 top-0 rounded-md bg-foreground px-2 py-0.5 font-mono text-xs font-bold text-background opacity-0 transition-opacity"
      >
        hi!
      </div>
      <div
        ref={zzRef}
        className="absolute left-0 top-0 font-mono text-sm font-bold text-muted-foreground opacity-0"
      >
        z
      </div>
      <canvas
        ref={canvasRef}
        width={W * PX}
        height={H * PX}
        onClick={() => sayHiRef.current()}
        className="pointer-events-auto absolute left-0 top-0 cursor-pointer [image-rendering:pixelated]"
      />
    </div>
  );
}
