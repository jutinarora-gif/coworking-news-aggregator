import { cn } from "@/lib/utils";

// Single source of truth for the brand mark so header/footer/anywhere else
// can't drift into different sizes or corner radii over time.
export function Logomark({ className }: { className?: string }) {
  return <div className={cn("rounded-[28%] gradient-iris", className)} />;
}
