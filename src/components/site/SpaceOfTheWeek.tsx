import type { CoworkingSpace } from "@/lib/types";

type FeaturedSpace = CoworkingSpace & {
  locations: { country: string; city: string | null; slug: string } | null;
};

export function SpaceOfTheWeek({ space }: { space: FeaturedSpace | null }) {
  if (!space) return null;

  const place = space.locations?.city ?? space.locations?.country ?? "";
  const microLocation = space.address?.split(",")[0]?.trim();

  return (
    <section className="border-b border-ink/15">
      <div className="px-6 sm:px-10 lg:px-14 pt-10">
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
          Coworking Space of the Week
        </span>
      </div>

      <a
        href={space.website ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative aspect-[21/9] overflow-hidden bg-ink mt-6">
          {space.image_url ? (
            <img
              src={space.image_url}
              alt={space.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-6xl text-paper/20 select-none">
                {space.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-ink/0" />
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-14 py-8">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-none tracking-tight text-paper group-hover:text-terracotta transition-colors duration-300">
              {space.name}
            </h2>
            {(microLocation || place) && (
              <p className="mt-3 font-sans text-xs uppercase tracking-[0.22em] text-paper/80">
                {microLocation ? `${microLocation}, ${place}` : place}
              </p>
            )}
          </div>
        </div>
      </a>

      <div className="px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between">
        <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-graphite">
          Featured pick · updated weekly
        </span>
        {space.website && (
          <a
            href={space.website}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-link font-sans text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            Visit website →
          </a>
        )}
      </div>
    </section>
  );
}
