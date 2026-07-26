import { ArrowUpRight } from "lucide-react";
import type { ArticleWithMeta } from "@/lib/queries";

function formatDateline(dateStr: string | null) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function Hero({
  featured,
  totalArticles,
  totalLocations,
}: {
  featured: ArticleWithMeta | null;
  totalArticles: number;
  totalLocations: number;
}) {
  const place = featured?.locations
    ? featured.locations.city
      ? `${featured.locations.city}, ${featured.locations.country}`
      : featured.locations.country
    : "Worldwide";

  const stats = [
    { label: "Destinations tracked", value: String(totalLocations) },
    { label: "Dispatches aggregated", value: String(totalArticles) },
    { label: "Updated", value: "Every 30 min" },
    { label: "Sources", value: "Public RSS only" },
  ];

  return (
    <section className="border-b border-ink/15">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:border-r border-ink/15 px-6 sm:px-10 lg:px-14 py-14 lg:py-20 flex flex-col justify-between rise-in">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
                Latest Dispatch
              </span>
              <span className="h-px flex-1 bg-ink/20 max-w-[160px]" />
              <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-graphite">
                {formatDateline(featured?.published_at ?? null)}
              </span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-ink">
              {featured ? (
                featured.title
              ) : (
                "Aggregating the world, one desk at a time."
              )}
            </h1>

            {featured?.summary && (
              <p className="mt-10 max-w-xl font-sans text-lg sm:text-xl font-light text-graphite leading-relaxed">
                {featured.summary}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-6">
              {featured && (
                <a
                  href={featured.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 px-6 py-3 border border-ink bg-ink text-paper font-sans text-[11px] uppercase tracking-[0.22em] hover:bg-paper hover:text-ink transition-colors duration-300"
                >
                  Read the dispatch
                  <ArrowUpRight
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                  />
                </a>
              )}
              <a
                href="#cities"
                className="editorial-link font-sans text-[11px] uppercase tracking-[0.22em] text-ink"
              >
                Or explore this month&apos;s destinations →
              </a>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-8 pt-10 border-t border-ink/15">
            <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-graphite">
              Dateline · {place}
            </span>
            {featured?.feed_sources?.name && (
              <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-graphite">
                Source · {featured.feed_sources.name}
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative bg-ink min-h-[400px] lg:min-h-[720px] overflow-hidden flex items-center justify-center">
          {featured?.locations?.image_url ? (
            <img
              src={featured.locations.image_url}
              alt={place}
              className="absolute inset-0 w-full h-full object-cover grayscale-hover"
            />
          ) : (
            <span className="font-serif text-[10rem] leading-none text-paper/10 select-none">
              CD
            </span>
          )}
          <div className="absolute top-6 left-6 right-6 flex justify-between font-sans text-[10px] uppercase tracking-[0.28em] text-paper mix-blend-difference">
            <span>Plate No.01</span>
            <span>{place}</span>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between font-sans text-[10px] uppercase tracking-[0.28em] text-paper mix-blend-difference">
            <span>Aggregated dispatch</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-ink/15">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-6 sm:px-10 py-8 border-ink/15 ${
              i % 2 === 0 ? "border-r" : ""
            } ${i < 2 ? "border-b lg:border-b-0" : ""} ${i < stats.length - 1 ? "lg:border-r" : ""}`}
          >
            <div className="font-serif text-4xl sm:text-5xl font-light text-ink leading-none">
              {s.value}
            </div>
            <div className="mt-3 font-sans text-[10px] uppercase tracking-[0.22em] text-graphite">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
