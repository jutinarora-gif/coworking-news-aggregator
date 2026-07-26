import type { Metadata } from "next";
import Link from "next/link";
import { getSpaceCitiesWithCounts } from "@/lib/queries";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Coworking Spaces in India",
  description:
    "Compare coworking spaces across India by city — pricing, plan types, and amenities, sourced from public listings.",
  alternates: { canonical: "/spaces" },
};

export default async function SpacesPage() {
  const cities = await getSpaceCitiesWithCounts();

  return (
    <main className="flex-1">
      <div className="border-b border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
          Space Files
        </span>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight text-ink">
          Coworking spaces in India
        </h1>
        <p className="mt-6 max-w-xl font-sans text-base font-light text-graphite leading-relaxed">
          Real pricing and amenities, sourced from public listings. Pick a city to browse, or
          select spaces to compare side by side.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city, idx) => (
          <Link
            key={city.id}
            href={`/spaces/${city.slug}`}
            className={`group px-6 sm:px-8 py-10 border-ink/15 ${
              idx % 3 !== 2 ? "lg:border-r" : ""
            } ${idx % 2 === 0 ? "sm:border-r lg:border-r" : ""} border-b`}
          >
            <h2 className="font-serif text-3xl leading-none tracking-tight text-ink group-hover:text-terracotta transition-colors duration-300">
              {city.city}
            </h2>
            <p className="mt-3 font-sans text-xs uppercase tracking-[0.18em] text-graphite">
              {city.spaceCount} spaces
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
