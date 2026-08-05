import type { ReactNode } from "react";
import { Info, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Shared, minimal building blocks for guide body content. Short, numbered,
// scannable steps rather than long prose. Sparing use of the iris accent
// (left border on callouts, step numbers, links).

export function WhyThisMatters({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-border/60 p-4 flex gap-3">
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-iris" />
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why this matters</div>
        <p className="mt-1 text-[15px] leading-6">{children}</p>
      </div>
    </div>
  );
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="mt-6 pt-6 border-t border-border/50 first:mt-8 first:pt-0 first:border-0">
      <div className="flex items-start gap-3">
        <div className="shrink-0 font-display text-2xl text-iris/80 tabular-nums w-8">{String(n).padStart(2, "0")}</div>
        <div className="min-w-0">
          <div className="font-display text-lg leading-snug">{title}</div>
          <div className="mt-1.5 text-[15px] leading-6 text-foreground/90 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-muted/50 p-3 flex gap-2.5">
      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Quick tip</div>
        <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

export function Source({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-muted-foreground">Source: {children}</p>;
}

export function Closing({ children }: { children: ReactNode }) {
  return <p className="mt-8 pt-6 border-t border-border/50 text-[15px] leading-6 text-muted-foreground">{children}</p>;
}

export function RelatedLink({ to, params, children }: { to: string; params?: Record<string, string>; children: ReactNode }) {
  return (
    <Link to={to} params={params} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm hover:border-iris/60 transition-colors group">
      <span>{children}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-iris" />
    </Link>
  );
}
