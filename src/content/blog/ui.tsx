import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Shared building blocks for blog post bodies, matching the pull-quote /
// heading style already established in the blog template.

export function Lead({ children }: { children: ReactNode }) {
  return <p className="font-display text-xl leading-relaxed">{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 font-display text-2xl">{children}</h2>;
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 font-display text-lg">{children}</h3>;
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="mt-8 border-l-4 border-flare pl-5 font-display text-2xl italic leading-snug text-foreground">
      {children}
    </blockquote>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-flare" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-3 space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="font-display text-lg text-muted-foreground tabular-nums w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function RelatedLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="mt-8 flex items-center justify-between gap-2 rounded-2xl bg-flare p-5 text-flare-ink transition-transform hover:-translate-y-0.5">
      <span className="font-display text-lg">{children}</span>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}
