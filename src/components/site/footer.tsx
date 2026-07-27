import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded gradient-iris" />
            <span className="font-display text-lg">The Coworking Dispatch</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            India-first coworking news, reviews and community. 70% India, 30% the rest of the world.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dispatches" className="hover:text-primary">Dispatches</Link></li>
            <li><Link to="/spaces" className="hover:text-primary">Spaces</Link></li>
            <li><Link to="/winners" className="hover:text-primary">Winners of the Week</Link></li>
            <li><Link to="/questions" className="hover:text-primary">Q&A</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Community</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/auth" className="hover:text-primary">Sign in / Join</Link></li>
            <li><a href="#" className="hover:text-primary">Suggest a feed</a></li>
            <li><a href="#" className="hover:text-primary">Submit a space</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">About</div>
          <p className="text-sm text-muted-foreground">
            Made in India, by coworkers, for coworkers.
          </p>

        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © 2026 The Coworking Dispatch
      </div>
    </footer>
  );
}
