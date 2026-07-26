const RULES = [
  {
    num: "01",
    title: "Take calls in a booth, not at your desk",
    body: "Open-plan desks carry sound further than you think. If it's longer than a quick exchange, move to a phone booth.",
  },
  {
    num: "02",
    title: "Book meeting rooms you'll actually use",
    body: "Ghost bookings are the #1 complaint in shared spaces. Cancel the moment you know you won't need the room.",
  },
  {
    num: "03",
    title: "Blur or clean your background on video calls",
    body: "Whoever's behind you didn't agree to be on your call. Blur your background or find a private corner.",
  },
  {
    num: "04",
    title: "Ask before you sit at someone's usual spot",
    body: "Hot desks are technically first-come, but regulars build routines. A quick check is common courtesy, not a rule.",
  },
  {
    num: "05",
    title: "Keep shared kitchens the way you found them",
    body: "Label your food, wash your own mug, and don't assume 'community' means someone else will clean up.",
  },
  {
    num: "06",
    title: "Don't photograph or film without asking",
    body: "Other members are working, not extras in your content. Check before pointing a camera across the floor.",
  },
];

export function Etiquette() {
  return (
    <section className="border-b border-ink/15">
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink/15">
        <div className="lg:col-span-5 lg:border-r border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
          <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
            Shared Space, Shared Rules
          </span>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
            Coworking <br />
            etiquette.
          </h2>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-ink/15 border-l border-ink/15">
          {RULES.map((r) => (
            <article key={r.num} className="px-6 sm:px-8 py-8 hover:bg-cream transition-colors duration-300">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-4xl font-light text-terracotta">{r.num}</span>
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite">Etiquette</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-ink">{r.title}</h3>
              <p className="mt-3 font-sans text-sm font-light text-graphite leading-relaxed">{r.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
