import Link from "next/link";

type LocationWithCount = {
  id: string;
  country: string;
  city: string | null;
  slug: string;
  image_url: string | null;
  articleCount: number;
};

export function CitySpotlight({ locations }: { locations: LocationWithCount[] }) {
  return (
    <section id="cities" className="border-b border-ink/15 bg-paper">
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink/15">
        <div className="lg:col-span-8 lg:border-r border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
          <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
            Section III — City Files
          </span>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
            Destinations worth <br />
            packing a carry-on for.
          </h2>
        </div>
        <div className="lg:col-span-4 px-6 sm:px-10 lg:px-14 py-14 flex items-end">
          <p className="font-sans text-base font-light text-graphite leading-relaxed">
            Each file aggregates live coworking news for the destination — no
            algorithms, no affiliate links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc, idx) => (
          <Link
            key={loc.id}
            href={`/country/${loc.slug}`}
            className={`group px-6 sm:px-8 py-10 border-ink/15 ${
              idx % 3 !== 2 ? "lg:border-r" : ""
            } ${idx % 2 === 0 ? "sm:border-r lg:border-r" : ""} border-b`}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-ink mb-6">
              {loc.image_url ? (
                <img
                  src={loc.image_url}
                  alt={`${loc.city ?? loc.country}, ${loc.country}`}
                  className="w-full h-full object-cover grayscale-hover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-serif text-6xl text-paper/20 select-none">
                    {(loc.city ?? loc.country).slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="absolute top-4 left-4 font-sans text-[10px] uppercase tracking-[0.28em] text-paper mix-blend-difference">
                N°{String(idx + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-ink/15 pb-3">
              <h3 className="font-serif text-3xl leading-none tracking-tight text-ink group-hover:text-terracotta transition-colors duration-300">
                {loc.city ?? loc.country}
              </h3>
              <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite">
                {loc.city ? loc.country : ""}
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-ink/15 pt-4">
              <div>
                <dt className="font-sans text-[9px] uppercase tracking-[0.22em] text-graphite">
                  Dispatches
                </dt>
                <dd className="mt-1 font-sans text-xs text-ink">{loc.articleCount}</dd>
              </div>
            </dl>

            <span className="mt-6 inline-flex items-center editorial-link font-sans text-[11px] uppercase tracking-[0.22em] text-ink">
              Open the file →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
