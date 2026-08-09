import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gamepad2, ArrowUpRight } from "lucide-react";
import { getDeskHopStats } from "./desk-hop-game";

export function DeskHopTeaser() {
  const [highScore, setHighScore] = useState<number | null>(null);

  useEffect(() => {
    setHighScore(getDeskHopStats().highScore);
  }, []);

  return (
    <Link
      to="/play"
      className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-foreground/10 bg-card p-6 sm:p-8 hover-glow hover:hover-glow-hover"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-flare text-flare-ink">
          <Gamepad2 className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Arcade</div>
          <div className="font-display text-2xl">Play Desk Hop</div>
          <p className="mt-1 text-sm text-muted-foreground">One button. Hop desks, dodge the printer jam.</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {highScore != null && highScore > 0 && (
          <span className="rounded-full bg-flare px-3 py-1 text-xs font-medium text-flare-ink">High score {highScore}</span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium group-hover:border-foreground">
          Start run <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
