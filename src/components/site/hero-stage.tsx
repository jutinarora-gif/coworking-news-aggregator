import { useState } from "react";
import { Search } from "lucide-react";
import { SearchDialog } from "./search-dialog";

/**
 * Minimal hero: a warm grey band, one oversized headline with a mint full
 * stop, and a sleek capsule search field.
 */
export function HeroStage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative py-20 sm:py-28 lg:py-32">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="acid-dot inline-block h-2 w-2 rounded-full" />
        Live, 70% India, 30% world
      </div>

      <h1 className="mt-8 max-w-[16ch] font-display text-[14vw] font-bold leading-[0.82] tracking-[-0.055em] sm:text-[10vw] lg:text-[7.4vw]">
        Every space has a story. We're tracking all of them<span className="text-flare">.</span>
      </h1>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mt-10 flex w-full max-w-xl items-center gap-3 rounded-full border border-foreground/20 bg-background/70 px-5 py-3.5 text-left backdrop-blur transition-all hover:border-foreground/50 hover:bg-background sm:mt-12 sm:py-4"
      >
        <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground sm:text-base">
          Search a space, a city, or a dispatch
        </span>
        <kbd className="hidden shrink-0 rounded-full border border-foreground/15 px-2.5 py-1 text-[10px] tracking-widest text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <SearchDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
