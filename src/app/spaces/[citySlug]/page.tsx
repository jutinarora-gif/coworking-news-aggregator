import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpacesByLocationSlug } from "@/lib/queries";
import { SpaceGrid } from "@/components/site/SpaceGrid";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ citySlug: string }>;
}): Promise<Metadata> {
  const { citySlug } = await params;
  const { location } = await getSpacesByLocationSlug(citySlug);
  if (!location) return {};
  const place = location.city ?? location.country;
  return {
    title: `Coworking Spaces in ${place}`,
    description: `Compare coworking spaces in ${place} — pricing, plan types, and amenities, sourced from public listings.`,
    alternates: { canonical: `/spaces/${citySlug}` },
  };
}

export default async function CitySpacesPage({
  params,
}: {
  params: Promise<{ citySlug: string }>;
}) {
  const { citySlug } = await params;
  const { location, spaces } = await getSpacesByLocationSlug(citySlug);

  if (!location) notFound();

  const place = location.city ?? location.country;

  return (
    <main className="flex-1 pb-24">
      <div className="border-b border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
          Space File
        </span>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
          Coworking spaces in {place}
        </h1>
        <p className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-graphite">
          {spaces.length} spaces · select up to 3 to compare
        </p>
      </div>

      <div className="px-6 sm:px-10 lg:px-14 py-10">
        {spaces.length > 0 ? (
          <SpaceGrid spaces={spaces} citySlug={citySlug} />
        ) : (
          <p className="font-sans text-sm text-graphite">
            No spaces listed for {place} yet.
          </p>
        )}
      </div>
    </main>
  );
}
