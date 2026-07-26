"use client";

import { useMemo, useState } from "react";
import type { ArticleWithMeta } from "@/lib/queries";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function NewsFeed({
  articles,
  kicker = "Section II — Dispatches",
  heading = (
    <>
      The world, <br />
      <em className="italic font-light">from a desk near you.</em>
    </>
  ),
  description = "Coworking and remote-work news aggregated per destination — space openings, community trends, and what's changing where remote workers sit down.",
  showFilters = true,
}: {
  articles: ArticleWithMeta[];
  kicker?: string;
  heading?: React.ReactNode;
  description?: string;
  showFilters?: boolean;
}) {
  const countries = useMemo(() => {
    const set = new Set(articles.map((a) => a.locations?.country).filter(Boolean) as string[]);
    return ["All", ...Array.from(set).sort()];
  }, [articles]);

  const [country, setCountry] = useState("All");

  const filtered = useMemo(
    () => (country === "All" ? articles : articles.filter((a) => a.locations?.country === country)),
    [articles, country]
  );

  return (
    <section id="news" className="border-b border-ink/15">
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink/15">
        <div className="lg:col-span-4 px-6 sm:px-10 lg:px-14 py-14 lg:border-r border-ink/15">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-terracotta">
            {kicker}
          </span>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
            {heading}
          </h2>
          <p className="mt-6 font-sans text-base font-light text-graphite leading-relaxed max-w-md">
            {description}
          </p>
        </div>

        {showFilters && countries.length > 2 && (
          <div className="lg:col-span-8 px-6 sm:px-10 lg:px-14 py-10 flex items-end">
            <div className="flex flex-wrap gap-2">
              {countries.map((c) => {
                const active = c === country;
                return (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`px-4 py-2 border font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                      active
                        ? "bg-ink text-paper border-ink"
                        : "bg-transparent text-ink border-ink/30 hover:border-ink"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ul className="divide-y divide-ink/15">
        {filtered.map((a, idx) => (
          <li
            key={a.id}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 px-6 sm:px-10 lg:px-14 py-10 hover:bg-cream/60 transition-colors duration-300"
          >
            <div className="lg:col-span-1 font-serif text-2xl text-graphite">
              {String(idx + 1).padStart(2, "0")}
            </div>

            <div className="lg:col-span-2 flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
                {a.locations?.city ? `${a.locations.city}, ${a.locations.country}` : a.locations?.country ?? "Global"}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
                {formatDate(a.published_at)}
              </span>
            </div>

            <div className="lg:col-span-9 flex flex-col justify-center">
              <a href={a.link} target="_blank" rel="noopener noreferrer">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-[1.05] tracking-tight text-ink group-hover:text-terracotta transition-colors duration-300">
                  {a.title}
                </h3>
              </a>
              {a.summary && (
                <p className="mt-4 font-sans text-base font-light text-graphite leading-relaxed max-w-2xl">
                  {a.summary}
                </p>
              )}
              {a.feed_sources?.name && (
                <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
                  Source · {a.feed_sources.name}
                </span>
              )}
            </div>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="px-6 sm:px-10 lg:px-14 py-16 text-center font-mono text-xs uppercase tracking-[0.22em] text-graphite">
            No dispatches yet — run the ingest job to populate this destination.
          </li>
        )}
      </ul>

      <div className="px-6 sm:px-10 lg:px-14 py-10 flex items-center justify-between border-t border-ink/15">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
          Showing {filtered.length} of {articles.length} dispatches
        </span>
      </div>
    </section>
  );
}
