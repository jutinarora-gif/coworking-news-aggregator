import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import type { HomePriceStats } from "@/lib/data.functions";

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type CityStat = HomePriceStats["cities"][number];

function verdict(budget: number, c: CityStat) {
  if (budget < c.min) return `Nothing we track in ${c.name} starts under ${inr(c.min)}.`;
  if (budget < c.median) return `Below the ${c.name} median. You are in value territory.`;
  if (budget < c.median * 1.5) return `Right around what ${c.name} actually charges.`;
  return `Well above the ${c.name} median. Make them justify the gap.`;
}

function BudgetMatches({ city, budget }: { city: CityStat; budget: number }) {
  const matches = city.spaces.filter((s) => s.price_from <= budget).slice(0, 4);

  return (
    <div className="mt-8 border-t border-border/60 pt-8">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {matches.length > 0 ? `Fits your budget in ${city.name}` : `Nothing in ${city.name} fits yet`}
      </div>
      {matches.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {matches.map((s) => (
            <Link
              key={s.slug}
              to="/spaces/$slug"
              params={{ slug: s.slug }}
              className="group rounded-2xl border border-border/60 bg-background/40 p-4 transition-all hover:border-foreground hover:bg-background"
            >
              <div className="truncate font-display text-sm leading-tight">{s.name}</div>
              <div className="mt-3 font-display text-lg leading-none">
                {inr(s.price_from)}
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          The cheapest space we track in {city.name} is {inr(city.min)}/mo. Raise the slider to see options.
        </p>
      )}
    </div>
  );
}

export function PriceShowstopper({ stats }: { stats: HomePriceStats }) {
  const cities = useMemo(
    () => stats.cities.filter((c) => c.region === "india").sort((a, b) => b.median - a.median),
    [stats.cities],
  );

  const indiaMedian = useMemo(() => {
    const all = [...cities].map((c) => c.median).sort((a, b) => a - b);
    if (!all.length) return 0;
    const mid = Math.floor(all.length / 2);
    return all.length % 2 === 0 ? (all[mid - 1] + all[mid]) / 2 : all[mid];
  }, [cities]);

  const indiaCount = cities.reduce((n, c) => n + c.count, 0);
  const indiaMin = Math.min(...cities.map((c) => c.min), Infinity);
  const indiaMax = Math.max(...cities.map((c) => c.max), 0);

  const [tab, setTab] = useState<"cities" | "budget">("cities");
  const [cityName, setCityName] = useState<string>(cities[0]?.name ?? "");
  const [budget, setBudget] = useState<number>(Math.round(indiaMedian / 500) * 500);

  if (!cities.length) return null;

  const city = cities.find((c) => c.name === cityName) ?? cities[0];
  const maxMedian = Math.max(...cities.map((c) => c.median), 1);
  const sliderMin = Math.floor(indiaMin / 500) * 500;
  const sliderMax = Math.ceil(Math.min(indiaMax, indiaMedian * 4) / 500) * 500;
  const vsMedian = Math.round(((budget - city.median) / city.median) * 100);
  const cheaperCities = cities.filter((c) => budget >= c.median).length;

  const newest = stats.newest.filter((s) => cities.some((c) => c.name === s.city_name));

  return (
    <section className="section-mist py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="acid-dot inline-block h-2 w-2 rounded-full" />
          India price intelligence
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl">What a desk costs in India</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Median monthly desk price across {indiaCount} tracked spaces in {cities.length} Indian cities.
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-5xl leading-none tracking-[-0.05em] sm:text-6xl">{inr(indiaMedian)}</div>
            <div className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">India median per month</div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-border/70 p-1">
            {([["cities", "Median by city"], ["budget", "Check my budget"]] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={tab === key}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  tab === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {stats.lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last checked {formatDate(stats.lastUpdated)}
            </div>
          )}
        </div>

        {tab === "cities" ? (
          <ul className="mt-6 divide-y divide-border/50 border-y border-border/50">
            {cities.map((c) => {
              const pct = Math.max((c.median / maxMedian) * 100, 4);
              return (
                <li key={c.name}>
                  <Link
                    to="/spaces"
                    search={{ city: c.name }}
                    className="group flex items-center gap-4 py-3 outline-none"
                    aria-label={`Browse spaces in ${c.name}, median ${inr(c.median)}`}
                  >
                    <span className="w-[110px] shrink-0 truncate text-sm transition-colors group-hover:text-foreground sm:w-[150px]">{c.name}</span>
                    <span className="relative hidden h-2.5 flex-1 overflow-hidden rounded-full bg-foreground/10 sm:block">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-colors duration-200 group-hover:bg-[var(--flare)]"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="ml-auto w-[86px] shrink-0 text-right font-display text-base tabular-nums sm:ml-0">{inr(c.median)}</span>
                    <span className="hidden w-[80px] shrink-0 text-right text-xs text-muted-foreground tabular-nums sm:block">
                      {c.count} {c.count === 1 ? "space" : "spaces"}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-background/60 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => {
                const on = c.name === city.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCityName(c.name)}
                    aria-pressed={on}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                      on ? "border-foreground bg-foreground text-background" : "border-border/70 text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] md:gap-12">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Your monthly budget</div>
                <div className="mt-1 font-display text-5xl leading-none tracking-[-0.05em] tabular-nums">{inr(budget)}</div>
                <label className="sr-only" htmlFor="budget-slider">Monthly budget</label>
                <input
                  id="budget-slider"
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={500}
                  value={Math.min(Math.max(budget, sliderMin), sliderMax)}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="budget-range mt-6 w-full"
                />
                <div className="mt-2 flex justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span>{inr(sliderMin)}</span>
                  <span>{inr(sliderMax)}+</span>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 rounded-2xl border border-border/60 bg-background p-5">
                <div
                  className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium tabular-nums"
                  style={{
                    backgroundColor: vsMedian <= 0 ? "var(--flare)" : "transparent",
                    border: vsMedian <= 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  {vsMedian === 0 ? `Exactly the ${city.name} median` : `${Math.abs(vsMedian)}% ${vsMedian < 0 ? "below" : "above"} ${city.name} median`}
                </div>
                <p className="text-sm text-muted-foreground">{verdict(budget, city)}</p>
                <p className="text-xs text-muted-foreground">Beats the median in {cheaperCities} of {cities.length} Indian cities.</p>
                <Link
                  to="/spaces"
                  search={{ city: city.name }}
                  className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  See {city.name} spaces
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <BudgetMatches city={city} budget={budget} />
          </div>
        )}

        {newest.length > 0 && (
          <div className="mt-14 border-t border-border/60 pt-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">New this week</div>
              <Link to="/spaces" search={{ city: undefined }} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Browse all spaces
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {newest.slice(0, 4).map((s) => (
                <Link
                  key={s.id}
                  to="/spaces/$slug"
                  params={{ slug: s.slug }}
                  className="group rounded-2xl border border-border/60 bg-background/40 p-4 transition-all hover:border-foreground hover:bg-background"
                >
                  <div className="truncate font-display text-sm leading-tight">{s.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.city_name}</div>
                  <div className="mt-3 font-display text-lg leading-none">
                    {inr(Number(s.price_from ?? 0))}
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
