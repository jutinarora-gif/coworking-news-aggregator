import { cn } from "@/lib/utils";

// Single source of truth for the brand mark so header/footer/anywhere else
// can't drift into different sizes or corner radii over time. Solid mint
// square with "TCD" instead of the gradient squircle - renders identically
// everywhere (email clients included), no gradient-rendering risk.
export function Logomark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[28%] bg-[#65e7d1] flex items-center justify-center font-display font-extrabold tracking-wide text-[#0f4a3f]",
        className,
      )}
    >
      TCD
    </div>
  );
}
