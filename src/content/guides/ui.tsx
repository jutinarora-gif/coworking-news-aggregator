import type { ReactNode } from "react";

// Shared, minimal building blocks for guide body content. Deliberately
// plain typography, no gradients or glass panels, sparing use of the
// iris accent (links and small labels only).

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 font-display text-2xl">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[15px] leading-7 text-foreground/90">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2 text-[15px] leading-7 text-foreground/90 list-disc pl-5">{children}</ul>;
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="mt-4 space-y-2 text-[15px] leading-7 text-foreground/90 list-decimal pl-5">{children}</ol>;
}

export function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-6 border-l-2 border-iris pl-4 py-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-iris">{label}</div>
      <div className="mt-1 text-[15px] leading-7 text-foreground/90">{children}</div>
    </div>
  );
}

export function Source({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs text-muted-foreground">Source: {children}</p>;
}
