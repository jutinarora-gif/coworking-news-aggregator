import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpaceBySlug } from "@/lib/queries";

export const revalidate = 1800;

function formatPrice(space: { price_min: number | null; price_max: number | null; price_unit: string | null }) {
  if (space.price_unit === "Contact for pricing" || (!space.price_min && !space.price_max)) {
    return "Contact for pricing";
  }
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  if (space.price_min && space.price_max && space.price_min !== space.price_max) {
    return `${fmt(space.price_min)}–${fmt(space.price_max)} ${space.price_unit ?? ""}`;
  }
  const n = space.price_min ?? space.price_max;
  return n ? `${fmt(n)} ${space.price_unit ?? ""}` : "Contact for pricing";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ citySlug: string; spaceSlug: string }>;
}): Promise<Metadata> {
  const { spaceSlug, citySlug } = await params;
  const space = await getSpaceBySlug(spaceSlug);
  if (!space) return {};
  const place = space.locations?.city ?? space.locations?.country ?? "";
  return {
    title: `${space.name} — Coworking Space in ${place}`,
    description: `${space.name} in ${place}: pricing, plan types, and amenities. ${
      space.address ? `Located at ${space.address}.` : ""
    }`,
    alternates: { canonical: `/spaces/${citySlug}/${spaceSlug}` },
  };
}

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ citySlug: string; spaceSlug: string }>;
}) {
  const { spaceSlug } = await params;
  const space = await getSpaceBySlug(spaceSlug);

  if (!space) notFound();

  const place = space.locations?.city ?? space.locations?.country ?? "";

  return (
    <main className="flex-1">
      <div className="border-b border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
          {place}
        </span>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
          {space.name}
        </h1>
        {space.address && (
          <p className="mt-4 font-sans text-sm text-graphite">{space.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-ink/15">
        <div className="lg:col-span-2 lg:border-r border-ink/15 px-6 sm:px-10 lg:px-14 py-10">
          <h2 className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite mb-3">
            Amenities
          </h2>
          {space.amenities && space.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-8">
              {space.amenities.map((a) => (
                <span
                  key={a}
                  className="font-sans text-xs text-ink border border-ink/15 px-3 py-1.5"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-sans text-sm text-graphite mb-8">Not listed.</p>
          )}

          <h2 className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite mb-3">
            Plan types
          </h2>
          {space.plan_types && space.plan_types.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-8">
              {space.plan_types.map((p) => (
                <span
                  key={p}
                  className="font-sans text-xs text-ink border border-ink/15 px-3 py-1.5"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-sans text-sm text-graphite mb-8">Not listed.</p>
          )}

          {space.notes && (
            <>
              <h2 className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite mb-3">
                Notes
              </h2>
              <p className="font-sans text-sm text-graphite leading-relaxed">{space.notes}</p>
            </>
          )}
        </div>

        <div className="px-6 sm:px-10 lg:px-14 py-10">
          <h2 className="font-sans text-[10px] uppercase tracking-[0.22em] text-graphite mb-3">
            Pricing
          </h2>
          <p className="font-serif text-2xl text-ink mb-8">{formatPrice(space)}</p>

          {space.website && (
            <a
              href={space.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 border border-ink bg-ink text-paper font-sans text-[11px] uppercase tracking-[0.22em] hover:bg-paper hover:text-ink transition-colors duration-300 mb-6"
            >
              Visit website →
            </a>
          )}

          {space.source_url && (
            <p className="font-sans text-[10px] text-graphite leading-relaxed">
              Sourced from{" "}
              <a href={space.source_url} target="_blank" rel="noopener noreferrer" className="editorial-link">
                {new URL(space.source_url).hostname}
              </a>
              {space.verified_at && ` · verified ${space.verified_at}`}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
