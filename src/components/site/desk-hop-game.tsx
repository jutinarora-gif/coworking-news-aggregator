import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

const HIGH_SCORE_KEY = "deskhop_highscore";
const TOTAL_RUNS_KEY = "deskhop_totalruns";
const TOTAL_DESKS_KEY = "deskhop_totaldesks";

export function getDeskHopStats() {
  if (typeof window === "undefined") return { highScore: 0, totalRuns: 0, totalDesks: 0 };
  return {
    highScore: Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0),
    totalRuns: Number(localStorage.getItem(TOTAL_RUNS_KEY) ?? 0),
    totalDesks: Number(localStorage.getItem(TOTAL_DESKS_KEY) ?? 0),
  };
}

// Logical game resolution - canvas is scaled to fit its container via CSS,
// with devicePixelRatio applied separately for crispness.
const W = 900;
const H = 380;
const GROUND_Y = 280;
const GRAVITY = 2600;
const JUMP_V = -900;
const JUMP_V_MAX = -1250;
const RUN_SPEED_BASE = 260;
const PLAYER_X = 170;
const PLAYER_W = 26;
const PLAYER_H = 38;

type Phase = "idle" | "playing" | "paused" | "gameover";
type ObstacleKind = "spill" | "popup" | "printer" | "chair";
type CollectibleKind = "coffee" | "wifi" | "coin";

type Desk = { x: number; w: number; wobbleAt: number | null; scored: boolean };
type Obstacle = { x: number; w: number; h: number; kind: ObstacleKind; deskEnd: number };
type Collectible = { x: number; y: number; r: number; kind: CollectibleKind; taken: boolean };

function colorVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function DeskHopGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const holdStartRef = useRef<number | null>(null);

  const phaseRef = useRef<Phase>("idle");
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const stateRef = useRef({
    playerY: GROUND_Y - PLAYER_H,
    vy: 0,
    grounded: true,
    cameraX: 0,
    runSpeed: RUN_SPEED_BASE,
    desks: [] as Desk[],
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    nextSpawnX: 0,
    desksHopped: 0,
    score: 0,
    tick: 0,
  });

  const colorsRef = useRef({ flare: "#8fe37a", ink: "#161616", paper: "#f7f4ec", muted: "#8a8578", border: "#ddd7c8" });

  useEffect(() => {
    colorsRef.current = {
      flare: colorVar("--flare", "#8fe37a"),
      ink: colorVar("--foreground", "#161616"),
      paper: colorVar("--background", "#f7f4ec"),
      muted: colorVar("--muted-foreground", "#8a8578"),
      border: colorVar("--border", "#ddd7c8"),
    };
  }, []);

  const resetWorld = useCallback(() => {
    const s = stateRef.current;
    s.playerY = GROUND_Y - PLAYER_H;
    s.vy = 0;
    s.grounded = true;
    s.cameraX = 0;
    s.runSpeed = RUN_SPEED_BASE;
    s.desks = [{ x: 0, w: 260, wobbleAt: null, scored: true }];
    s.obstacles = [];
    s.collectibles = [];
    s.nextSpawnX = 260;
    s.desksHopped = 0;
    s.score = 0;
    s.tick = 0;
    setScore(0);
  }, []);

  const spawnNext = useCallback(() => {
    const s = stateRef.current;
    const difficulty = Math.floor(s.desksHopped / 10);
    const gapMin = 60 + Math.min(difficulty * 6, 90);
    const gapMax = 100 + Math.min(difficulty * 10, 160);
    const gap = gapMin + Math.random() * (gapMax - gapMin);
    const deskW = 90 + Math.random() * 90;
    const deskX = s.nextSpawnX + gap;

    const wobble = Math.random() < 0.25 + Math.min(difficulty * 0.03, 0.25);
    s.desks.push({ x: deskX, w: deskW, wobbleAt: wobble ? -1 : null, scored: false });

    const obstacleChance = 0.18 + Math.min(difficulty * 0.03, 0.35);
    if (deskW > 70 && Math.random() < obstacleChance) {
      const kinds: ObstacleKind[] = ["spill", "popup", "printer", "chair"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const ow = 30;
      const oh = kind === "popup" ? 34 : 22;
      const ox = deskX + deskW / 2 - ow / 2 + (Math.random() - 0.5) * 20;
      s.obstacles.push({ x: Math.max(deskX + 8, ox), w: ow, h: oh, kind, deskEnd: deskX + deskW });
    }

    if (Math.random() < 0.45) {
      const kinds: CollectibleKind[] = ["coffee", "coffee", "wifi", "wifi", "coin"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const overGap = Math.random() < 0.5;
      const cx = overGap ? s.nextSpawnX + gap * 0.4 : deskX + deskW / 2;
      const cy = overGap ? GROUND_Y - 70 - Math.random() * 30 : GROUND_Y - 60;
      s.collectibles.push({ x: cx, y: cy, r: 11, kind, taken: false });
    }

    s.nextSpawnX = deskX + deskW;
  }, []);

  const endRun = useCallback(() => {
    const s = stateRef.current;
    phaseRef.current = "gameover";
    setPhase("gameover");
    const stats = getDeskHopStats();
    const newHigh = Math.max(stats.highScore, s.score);
    localStorage.setItem(HIGH_SCORE_KEY, String(newHigh));
    localStorage.setItem(TOTAL_RUNS_KEY, String(stats.totalRuns + 1));
    localStorage.setItem(TOTAL_DESKS_KEY, String(stats.totalDesks + s.desksHopped));
    setHighScore(newHigh);
  }, []);

  const doJump = useCallback((power: number) => {
    const s = stateRef.current;
    if (phaseRef.current !== "playing") return;
    if (!s.grounded) return;
    s.vy = power;
    s.grounded = false;
  }, []);

  const startRun = useCallback(() => {
    resetWorld();
    phaseRef.current = "playing";
    setPhase("playing");
    for (let i = 0; i < 6; i++) spawnNext();
  }, [resetWorld, spawnNext]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") {
      phaseRef.current = "paused";
      setPhase("paused");
    } else if (phaseRef.current === "paused") {
      phaseRef.current = "playing";
      setPhase("playing");
      lastTsRef.current = performance.now();
    }
  }, []);

  // Game loop
  useEffect(() => {
    setHighScore(getDeskHopStats().highScore);

    function frame(ts: number) {
      rafRef.current = requestAnimationFrame(frame);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (!lastTsRef.current) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      dt = Math.min(dt, 1 / 30);

      const s = stateRef.current;

      if (phaseRef.current === "playing") {
        s.tick += dt;
        s.runSpeed = RUN_SPEED_BASE + Math.min(Math.floor(s.desksHopped / 10) * 22, 220);
        s.cameraX += s.runSpeed * dt;

        s.vy += GRAVITY * dt;
        s.playerY += s.vy * dt;

        const playerWorldX = s.cameraX + PLAYER_X;
        const footY = s.playerY + PLAYER_H;

        let onDesk: Desk | null = null;
        for (const d of s.desks) {
          if (playerWorldX + PLAYER_W * 0.3 >= d.x && playerWorldX + PLAYER_W * 0.7 <= d.x + d.w) {
            onDesk = d;
            break;
          }
        }

        if (onDesk && footY >= GROUND_Y && s.vy >= 0) {
          s.playerY = GROUND_Y - PLAYER_H;
          s.vy = 0;
          s.grounded = true;
          if (!onDesk.scored) {
            onDesk.scored = true;
            s.desksHopped += 1;
            s.score += 1;
            setScore(s.score);
            if (Math.random() < 0.3) onDesk.wobbleAt = s.tick;
          }
        } else if (!onDesk && footY >= GROUND_Y) {
          // At/below desk-surface height with nothing underfoot: this is a
          // gap, not a landing. All desks sit at the same GROUND_Y, so
          // reaching ground level here (rather than arriving mid-air from a
          // jump arc) means the run was never actually airborne over the
          // gap - end it immediately instead of free-falling further, or a
          // narrow-enough gap could be crossed at ground level with no jump
          // at all.
          endRun();
        } else if (!onDesk) {
          s.grounded = false;
        }

        for (const o of s.obstacles) {
          const px1 = playerWorldX + 4, px2 = playerWorldX + PLAYER_W - 4;
          const py1 = s.playerY + 4, py2 = s.playerY + PLAYER_H;
          const ox1 = o.x, ox2 = o.x + o.w;
          const oy1 = GROUND_Y - o.h, oy2 = GROUND_Y;
          if (px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1) {
            endRun();
            break;
          }
        }

        for (const c of s.collectibles) {
          if (c.taken) continue;
          const px = playerWorldX + PLAYER_W / 2, py = s.playerY + PLAYER_H / 2;
          const dx = px - c.x, dy = py - c.y;
          if (Math.hypot(dx, dy) < c.r + 16) {
            c.taken = true;
            const pts = c.kind === "coin" ? 5 : 1;
            s.score += pts;
            setScore(s.score);
          }
        }

        while (s.nextSpawnX - s.cameraX < W + 300) spawnNext();
        s.desks = s.desks.filter((d) => d.x + d.w - s.cameraX > -50);
        s.obstacles = s.obstacles.filter((o) => o.x - s.cameraX > -50);
        s.collectibles = s.collectibles.filter((c) => c.taken || c.x - s.cameraX > -50);
      }

      draw(ctx, stateRef.current, phaseRef.current, colorsRef.current);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [endRun, spawnNext]);

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = wrap!.clientWidth;
      const cssH = cssW * (H / W);
      canvas!.style.width = `${cssW}px`;
      canvas!.style.height = `${cssH}px`;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      const ctx = canvas!.getContext("2d");
      ctx?.setTransform(dpr * (canvas!.width / dpr / W), 0, 0, dpr * (canvas!.height / dpr / H), 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Input
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (e.repeat) return;
        if (phaseRef.current === "idle" || phaseRef.current === "gameover") startRun();
        else doJump(JUMP_V);
      } else if ((e.key === "p" || e.key === "P") && !e.repeat) {
        togglePause();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [doJump, startRun, togglePause]);

  const onPointerDown = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "gameover") {
      startRun();
      return;
    }
    holdStartRef.current = performance.now();
  }, [startRun]);

  const onPointerUp = useCallback(() => {
    if (holdStartRef.current == null) return;
    const held = performance.now() - holdStartRef.current;
    holdStartRef.current = null;
    const t = Math.min(held / 350, 1);
    const power = JUMP_V + t * (JUMP_V_MAX - JUMP_V);
    doJump(power);
  }, [doJump]);

  const shareScore = useCallback(() => {
    const s = stateRef.current;
    const text = `I hopped ${s.desksHopped} desks and scored ${s.score} on Desk Hop, The Coworking Dispatch's arcade game. Beat my score at coworkingdispatch.com/play`;
    navigator.clipboard?.writeText(text).then(
      () => toast.success("Score copied, go paste it somewhere."),
      () => toast.error("Couldn't copy. Your browser blocked clipboard access."),
    );
  }, []);

  return (
    <div className="rounded-3xl border-2 border-foreground/10 bg-card shadow-sm overflow-hidden">
      <div ref={wrapRef} className="relative w-full select-none touch-none" style={{ aspectRatio: `${W} / ${H}` }}>
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />

        {phase === "idle" && (
          <Overlay>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Desk Hop</div>
            <h3 className="mt-1 font-display text-3xl">Ready to run?</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              Space, ArrowUp, or tap to jump. Clear the gaps, dodge the printer jams, grab the mint coins.
            </p>
            <button onClick={startRun} className="mt-5 inline-flex items-center gap-2 rounded-full bg-flare px-6 py-2.5 text-sm font-medium text-flare-ink hover:opacity-90">
              Start run
            </button>
            {highScore > 0 && <div className="mt-3 text-xs text-muted-foreground">High score: <span className="font-medium text-foreground">{highScore}</span></div>}
          </Overlay>
        )}

        {phase === "paused" && (
          <Overlay>
            <h3 className="font-display text-2xl">Paused</h3>
            <button onClick={togglePause} className="mt-4 inline-flex items-center gap-2 rounded-full bg-flare px-6 py-2.5 text-sm font-medium text-flare-ink hover:opacity-90">
              Resume
            </button>
          </Overlay>
        )}

        {phase === "gameover" && (
          <Overlay>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Run over</div>
            <h3 className="mt-1 font-display text-3xl">Score: {score}</h3>
            <div className="mt-1 text-xs text-muted-foreground">
              {stateRef.current.desksHopped} desks hopped {score > highScore - 1 && score >= highScore ? "· new high score" : ""}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button onClick={startRun} className="inline-flex items-center gap-2 rounded-full bg-flare px-6 py-2.5 text-sm font-medium text-flare-ink hover:opacity-90">
                Run again
              </button>
              <button onClick={shareScore} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground">
                Share score
              </button>
            </div>
          </Overlay>
        )}

        {phase === "playing" && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="rounded-full bg-background/85 px-3 py-1 text-sm font-display tabular-nums shadow-sm">{score}</div>
            <button onClick={togglePause} className="pointer-events-auto rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground shadow-sm hover:text-foreground">
              Pause (P)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-background/92 backdrop-blur-[1px] px-6">
      {children}
    </div>
  );
}

function draw(
  ctx: CanvasRenderingContext2D,
  s: ReturnType<typeof makeGameState>,
  phase: Phase,
  colors: { flare: string; ink: string; paper: string; muted: string; border: string },
) {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, W, H);

  // Windows (slow parallax)
  const winOffset = -((s.cameraX * 0.25) % 140);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 3;
  for (let x = winOffset - 140; x < W + 140; x += 140) {
    ctx.strokeRect(x + 20, 24, 90, 120);
    ctx.beginPath();
    ctx.moveTo(x + 65, 24);
    ctx.lineTo(x + 65, 144);
    ctx.moveTo(x + 20, 84);
    ctx.lineTo(x + 110, 84);
    ctx.stroke();
  }

  // Pendant lights (faster parallax)
  const lightOffset = -((s.cameraX * 0.5) % 180);
  for (let x = lightOffset - 180; x < W + 180; x += 180) {
    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 90, 0);
    ctx.lineTo(x + 90, 40);
    ctx.stroke();
    ctx.fillStyle = colors.ink;
    ctx.beginPath();
    ctx.arc(x + 90, 48, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground line
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + PLAYER_H + 2);
  ctx.lineTo(W, GROUND_Y + PLAYER_H + 2);
  ctx.stroke();

  const camX = s.cameraX;

  // Desks
  for (const d of s.desks) {
    const dx = d.x - camX;
    if (dx + d.w < -20 || dx > W + 20) continue;
    let wobble = 0;
    if (d.wobbleAt != null && d.wobbleAt >= 0) {
      const t = s.tick - d.wobbleAt;
      if (t < 0.5) wobble = Math.sin(t * 40) * 3 * (1 - t / 0.5);
    }
    ctx.save();
    ctx.translate(dx + d.w / 2, GROUND_Y + wobble);
    roundRect(ctx, -d.w / 2, 0, d.w, PLAYER_H + 20, 10);
    ctx.fillStyle = colors.ink;
    ctx.fill();
    ctx.restore();
  }

  // Obstacles
  for (const o of s.obstacles) {
    const ox = o.x - camX;
    if (ox + o.w < -20 || ox > W + 20) continue;
    drawObstacle(ctx, ox, GROUND_Y - o.h, o.w, o.h, o.kind, colors);
  }

  // Collectibles
  for (const c of s.collectibles) {
    if (c.taken) continue;
    const cx = c.x - camX;
    if (cx < -20 || cx > W + 20) continue;
    drawCollectible(ctx, cx, c.y, c.r, c.kind, colors);
  }

  // Player
  const px = PLAYER_X;
  const py = s.playerY;
  ctx.save();
  ctx.translate(px, py);
  ctx.fillStyle = colors.ink;
  roundRect(ctx, 2, 6, PLAYER_W - 4, PLAYER_H - 10, 6);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(PLAYER_W / 2, 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.flare;
  roundRect(ctx, -4, 14, 9, 14, 3);
  ctx.fill();
  ctx.restore();

  if (phase === "paused") {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(0, 0, W, H);
  }
}

function drawObstacle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, kind: ObstacleKind, colors: { ink: string }) {
  ctx.save();
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 3;
  if (kind === "spill") {
    ctx.fillStyle = "#8a5a2b";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 4, w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (kind === "popup") {
    ctx.fillStyle = "#e05252";
    roundRect(ctx, x, y, w, h - 8, 6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 5, y + h - 8);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x + w / 2 + 5, y + h - 8);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "printer") {
    ctx.fillStyle = "#6b6b6b";
    roundRect(ctx, x, y + 4, w, h - 4, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + w / 2 - 6, y - 6, 12, 10);
    ctx.strokeRect(x + w / 2 - 6, y - 6, 12, 10);
  } else {
    ctx.fillStyle = "#b08a5a";
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.lineTo(x + 4, y + 8);
    ctx.lineTo(x + w - 4, y + 6);
    ctx.lineTo(x + w - 2, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8);
    ctx.lineTo(x + 2, y - 4);
    ctx.lineTo(x + w - 2, y - 4);
    ctx.lineTo(x + w - 4, y + 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCollectible(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, kind: CollectibleKind, colors: { flare: string; ink: string }) {
  ctx.save();
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 2.5;
  if (kind === "coin") {
    ctx.fillStyle = colors.flare;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (kind === "coffee") {
    ctx.fillStyle = "#fff";
    roundRect(ctx, x - r * 0.7, y - r * 0.6, r * 1.4, r * 1.3, 3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + r * 0.7, y - r * 0.1, r * 0.35, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y + r * 0.4, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = colors.ink;
    ctx.fill();
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(x, y + r * 0.4, i * r * 0.5, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeGameState() {
  return {
    playerY: 0, vy: 0, grounded: true, cameraX: 0, runSpeed: 0,
    desks: [] as Desk[], obstacles: [] as Obstacle[], collectibles: [] as Collectible[],
    nextSpawnX: 0, desksHopped: 0, score: 0, tick: 0,
  };
}
