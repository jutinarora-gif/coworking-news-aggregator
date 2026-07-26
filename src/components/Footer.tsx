export function Footer() {
  return (
    <footer className="bg-paper text-ink">
      <div className="grid grid-cols-2 lg:grid-cols-12 border-t border-b border-ink/15">
        <div className="col-span-2 lg:col-span-5 px-6 sm:px-10 lg:px-14 py-14 lg:border-r border-ink/15">
          <span className="font-serif text-5xl leading-none tracking-tight">
            Coworking Dispatch
          </span>
          <p className="mt-4 max-w-md font-sans text-base font-light text-graphite leading-relaxed">
            An independent aggregator of coworking, cities, and the borderless
            life — coworking news by destination, published for wherever you
            work from next.
          </p>
        </div>

        <div className="col-span-1 lg:col-span-2 px-6 sm:px-10 py-14 border-r border-ink/15">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
            Sections
          </span>
          <ul className="mt-5 space-y-3 font-serif text-lg">
            <li>
              <a href="/#news" className="editorial-link">
                Dispatches
              </a>
            </li>
            <li>
              <a href="/#cities" className="editorial-link">
                City Files
              </a>
            </li>
            <li>
              <a href="/coworking" className="editorial-link">
                Coworking Industry
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-5 px-6 sm:px-10 lg:px-14 py-14">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
            About
          </span>
          <p className="mt-5 max-w-md font-sans text-sm font-light text-graphite leading-relaxed">
            News is aggregated automatically from public sources per
            destination. No affiliate links, no algorithmic ranking.
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-10 lg:px-14 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
          © {new Date().getFullYear()} Coworking Dispatch
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
          Set in Cormorant Garamond &amp; IBM Plex
        </span>
      </div>
    </footer>
  );
}
