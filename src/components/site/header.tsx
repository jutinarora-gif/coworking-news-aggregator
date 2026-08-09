import { Link, useRouterState } from "@tanstack/react-router";
import { Search, LogIn, Menu, Newspaper, Building2, Trophy, MessagesSquare, BookOpen, PenSquare, Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SearchDialog } from "./search-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logomark } from "./logomark";

const nav = [
  { to: "/dispatches", label: "Dispatches", icon: Newspaper },
  { to: "/spaces", label: "Spaces", icon: Building2 },
  { to: "/winners", label: "Best Value", icon: Trophy },
  { to: "/questions", label: "Q&A", icon: MessagesSquare },
  { to: "/guides", label: "Guides", icon: BookOpen },
  ...(import.meta.env.DEV
    ? [
        { to: "/blog", label: "Blog", icon: PenSquare },
        { to: "/play", label: "Play", icon: Gamepad2 },
      ]
    : []),
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage, the hero sits in a "mist" band; let the header float
  // transparent over it until the user scrolls, matching the hero's edge.
  const overMist = path === "/" && !scrolled;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Lets other components (e.g. the homepage hero search box) open this
  // dialog pre-filled, without prop-drilling search state through the tree.
  useEffect(() => {
    const onOpenSearch = (e: Event) => {
      const query = (e as CustomEvent<{ query?: string }>).detail?.query ?? "";
      setInitialQuery(query);
      setOpen(true);
    };
    window.addEventListener("app:open-search", onOpenSearch);
    return () => window.removeEventListener("app:open-search", onOpenSearch);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${overMist ? "bg-transparent" : "glass-strong"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:gap-6 sm:px-6">
        <Link to="/" className="group flex items-center gap-2 shrink-0 min-w-0">
          <Logomark className="h-9 w-9 shrink-0 text-[13px]" />
          <div className="leading-tight min-w-0">
            <div className="font-display text-base sm:text-lg truncate">The Coworking Dispatch</div>
            <div className="hidden sm:block text-[10px] uppercase tracking-widest text-muted-foreground">India-first · since 2026</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 ml-2">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative text-sm transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
                {active && <span className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-flare" />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => { setInitialQuery(""); setOpen(true); }}
            aria-label="Search"
            className="hidden sm:flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-flare hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="ml-2 hidden rounded bg-muted px-1.5 py-0.5 text-[10px] lg:inline">⌘K</kbd>
          </button>
          <button onClick={() => { setInitialQuery(""); setOpen(true); }} aria-label="Search" className="sm:hidden p-2 rounded-full border border-border shrink-0"><Search className="h-4 w-4" /></button>
          <div className="hidden md:block">
            {session ? (
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="mint">
                <Link to="/auth"><LogIn className="h-4 w-4 mr-1" />Sign in</Link>
              </Button>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-full border border-border shrink-0" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="font-display">The Coworking Dispatch</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {nav.map((n) => {
                  const active = path.startsWith(n.to);
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors ${active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 border-t border-border/50 pt-6">
                {session ? (
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant="mint">
                    <Link to="/auth"><LogIn className="h-4 w-4 mr-1" />Sign in</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <SearchDialog open={open} onOpenChange={setOpen} initialQuery={initialQuery} />
    </header>
  );
}
