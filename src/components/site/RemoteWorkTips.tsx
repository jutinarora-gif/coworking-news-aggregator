const TIPS = [
  {
    num: "01",
    title: "Check the visa runway first",
    body: "Tourist visas and remote-work visas have different rules on taxes and stay length. Confirm before booking anything non-refundable.",
  },
  {
    num: "02",
    title: "Test the wifi before you commit",
    body: "Advertised coworking speeds and actual peak-hour speeds are rarely the same number. Ask locals or check recent reviews.",
  },
  {
    num: "03",
    title: "Shoulder season beats peak season",
    body: "Fewer crowds, lower rent, and coworking spaces that still have desks free. Most destinations have one.",
  },
  {
    num: "04",
    title: "A week-long trial beats a month-long lease",
    body: "Neighborhoods read differently at 7am and 11pm. Don't commit to a month until you've spent a week actually living there.",
  },
];

export function RemoteWorkTips() {
  return (
    <section id="tips" className="border-b border-ink/15 bg-cream">
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink/15">
        <div className="lg:col-span-5 lg:border-r border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
          <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
            Section IV — Field Notes
          </span>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
            A few rules, <br />
            learned the hard way.
          </h2>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-ink/15 border-l border-ink/15">
          {TIPS.map((t) => (
            <article key={t.num} className="px-6 sm:px-8 py-8 hover:bg-paper transition-colors duration-300">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-4xl font-light text-terracotta">{t.num}</span>
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite">Rule</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-ink">{t.title}</h3>
              <p className="mt-3 font-sans text-sm font-light text-graphite leading-relaxed">{t.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
