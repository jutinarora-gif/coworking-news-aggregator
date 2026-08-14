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

export function RelatedLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="mt-8 flex items-center justify-between gap-2 rounded-2xl bg-flare p-5 text-flare-ink transition-transform hover:-translate-y-0.5">
      <span className="font-display text-lg">{children}</span>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}
