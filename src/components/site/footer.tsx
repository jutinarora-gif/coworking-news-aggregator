import { Link } from "@tanstack/react-router";
import { Logomark } from "./logomark";
import { TrustLine } from "./trust-line";

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-[var(--flare)]">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Logomark className="h-9 w-9 shrink-0 text-[13px]" />
            <span className="font-display text-sm font-semibold tracking-[-0.02em]">The Coworking Dispatch</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The Coworking Dispatch aggregates coworking industry news, hosts member reviews of coworking
            spaces, and runs a community Q&A, for India's coworking scene and the world.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dispatches" className="hover:text-primary">Dispatches</Link></li>
            <li><Link to="/spaces" className="hover:text-primary">Spaces</Link></li>
            <li><Link to="/winners" className="hover:text-primary">Best Value</Link></li>
            <li><Link to="/questions" className="hover:text-primary">Q&A</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Community</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/auth" className="hover:text-primary">Sign in / Join</Link></li>
            <li><a href="mailto:info@coworkingdispatch.com?subject=Suggest a feed" className="hover:text-primary">Suggest a feed</a></li>
            <li><Link to="/submit-space" className="hover:text-primary">Submit a space</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">About us</Link></li>
            <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms &amp; conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <TrustLine />
          <div className="text-xs text-muted-foreground text-center sm:text-right">
            © 2026 The Coworking Dispatch · Made in India, by coworkers, for coworkers.
          </div>
        </div>
      </div>
    </footer>
  );
}
