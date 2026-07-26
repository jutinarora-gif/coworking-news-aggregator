export function Subscribe() {
  return (
    <section id="subscribe" className="bg-ink text-paper">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:border-r border-paper/15 px-6 sm:px-10 lg:px-14 py-20">
          <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
            Section V — Stay in the loop
          </span>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight">
            Bookmark it. No inbox required.
          </h2>
          <p className="mt-6 font-sans text-lg font-light text-paper/70 leading-relaxed max-w-xl">
            This dispatch refreshes automatically from public sources every
            30 minutes — check back, or pick a destination above to follow
            its news directly.
          </p>
        </div>

        <div className="lg:col-span-5 px-6 sm:px-10 lg:px-14 py-20 flex items-center">
          <a
            href="/#cities"
            className="inline-flex items-center px-6 py-3 border border-paper bg-paper text-ink font-sans text-[11px] uppercase tracking-[0.22em] hover:bg-transparent hover:text-paper transition-colors duration-300"
          >
            Browse destinations →
          </a>
        </div>
      </div>
    </section>
  );
}
