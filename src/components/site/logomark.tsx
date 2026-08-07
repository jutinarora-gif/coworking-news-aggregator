import { cn } from "@/lib/utils";

// Single source of truth for the brand mark so header/footer/anywhere else
// can't drift into different sizes or corner radii over time.
export function Logomark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-foreground flex items-center justify-center font-display font-bold tracking-[-0.05em] text-background transition-colors duration-300 group-hover:bg-flare group-hover:text-flare-ink",
        className,
      )}
    >
      TCD
    </div>
  );
}
