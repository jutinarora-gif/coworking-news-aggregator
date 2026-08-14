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
            <li><Link to="/dispatches" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Dispatches</Link></li>
            <li><Link to="/spaces" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Spaces</Link></li>
            <li><Link to="/winners" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Best Value</Link></li>
            <li><Link to="/questions" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Q&A</Link></li>
            <li><Link to="/guides" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Guides</Link></li>
            <li><Link to="/blog" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Blog</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Community</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/auth" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Sign in / Join</Link></li>
            <li><a href="mailto:info@coworkingdispatch.com?subject=Suggest a feed" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Suggest a feed</a></li>
            <li><Link to="/submit-space" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Submit a space</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">About us</Link></li>
            <li><Link to="/careers" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Contact</Link></li>
            <li><Link to="/terms" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Terms &amp; conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">Privacy policy</Link></li>
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
