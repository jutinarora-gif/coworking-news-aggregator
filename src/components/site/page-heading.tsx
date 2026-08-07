import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  sub,
  icon,
  right,
}: {
  eyebrow: string;
  title: string;
  sub?: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />
          {icon}
          {eyebrow}
        </div>
        <h1 className="mt-1 font-display text-4xl md:text-5xl">{title}</h1>
        <span className="mt-3 block h-[3px] w-14 rounded-full bg-flare" />
        {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
