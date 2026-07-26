const QUESTIONS = [
  {
    num: "01",
    title: "What's the security deposit, and is it refundable?",
    body: "Ask how many months it is, when it's returned after you leave, and whether deductions are itemized or just withheld.",
  },
  {
    num: "02",
    title: "What's the notice period to cancel or downsize?",
    body: "Some spaces lock you in for 30-90 days even on \"flexible\" plans. Get the exact number before you sign, not after.",
  },
  {
    num: "03",
    title: "What operational support is actually included?",
    body: "IT support, mail handling, printing quotas, meeting room credits — ask what's free, what's metered, and what's extra.",
  },
  {
    num: "04",
    title: "What happens if you need to scale up or down mid-term?",
    body: "Growing teams need to know if extra desks are guaranteed at the same rate, or negotiated fresh each time.",
  },
  {
    num: "05",
    title: "Are there hidden charges beyond the quoted rate?",
    body: "Ask specifically about parking, extra meeting room hours, after-hours AC, and GST inclusion in the number they quoted.",
  },
  {
    num: "06",
    title: "What's the actual lock-in period, not just the plan length?",
    body: "A \"monthly\" plan can still have a 3-6 month lock-in buried in the contract. Ask directly, get it in writing.",
  },
];

export function SalespersonQuestions() {
  return (
    <section className="border-b border-ink/15 bg-cream">
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink/15">
        <div className="lg:col-span-5 lg:border-r border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
          <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
            Before You Sign
          </span>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
            What to ask <br />
            the salesperson.
          </h2>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-ink/15 border-l border-ink/15">
          {QUESTIONS.map((q) => (
            <article key={q.num} className="px-6 sm:px-8 py-8 hover:bg-paper transition-colors duration-300">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-4xl font-light text-terracotta">{q.num}</span>
                <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite">Ask</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-ink">{q.title}</h3>
              <p className="mt-3 font-sans text-sm font-light text-graphite leading-relaxed">{q.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
