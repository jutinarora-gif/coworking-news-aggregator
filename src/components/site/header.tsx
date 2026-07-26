import { Link, useRouterState } from "@tanstack/react-router";
import { Search, LogIn, Newspaper, Building2, Trophy, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SearchDialog } from "./search-dialog";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dispatches", label: "Dispatches", icon: Newspaper },
  { to: "/spaces", label: "Spaces", icon: Building2 },
  { to: "/winners", label: "Winners", icon: Trophy },
  { to: "/questions", label: "Q&A", icon: MessagesSquare },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg gradient-iris shadow-[0_0_24px_-4px_var(--iris-2)]" />
          <div className="leading-tight">
            <div className="font-display text-lg">The Coworking Dispatch</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">India-first · since 2026</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md glass text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search spaces, dispatches…</span>
            <kbd className="ml-4 rounded bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
          <button onClick={() => setOpen(true)} className="sm:hidden p-2 rounded-md glass"><Search className="h-4 w-4" /></button>
          {session ? (
            <Button asChild variant="secondary" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="gradient-iris text-primary-foreground font-medium">
              <Link to="/auth"><LogIn className="h-4 w-4 mr-1" />Sign in</Link>
            </Button>
          )}
        </div>
      </div>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </header>
  );
}
