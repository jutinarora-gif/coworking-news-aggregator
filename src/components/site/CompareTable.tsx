import Link from "next/link";
import type { CoworkingSpace } from "@/lib/types";

function formatPrice(space: CoworkingSpace) {
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

type SpaceWithLocation = CoworkingSpace & {
  locations: { country: string; city: string | null; slug: string } | null;
};

export function CompareTable({ spaces }: { spaces: SpaceWithLocation[] }) {
  const allAmenities = Array.from(new Set(spaces.flatMap((s) => s.amenities ?? [])));
  const allPlanTypes = Array.from(new Set(spaces.flatMap((s) => s.plan_types ?? [])));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left font-sans text-[10px] uppercase tracking-[0.18em] text-graphite border-b border-ink/15 px-4 py-4 align-bottom">
              &nbsp;
            </th>
            {spaces.map((s) => (
              <th key={s.id} className="text-left border-b border-ink/15 px-4 py-4 align-bottom">
                <Link
                  href={s.locations ? `/spaces/${s.locations.slug}/${s.slug}` : "#"}
                  className="font-serif text-xl text-ink hover:text-terracotta transition-colors duration-300"
                >
                  {s.name}
                </Link>
                <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.18em] text-graphite">
                  {s.locations?.city ?? s.locations?.country}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-sans text-[10px] uppercase tracking-[0.18em] text-graphite border-b border-ink/15 px-4 py-4">
              Price
            </td>
            {spaces.map((s) => (
              <td key={s.id} className="font-sans text-sm text-ink border-b border-ink/15 px-4 py-4">
                {formatPrice(s)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="font-sans text-[10px] uppercase tracking-[0.18em] text-graphite border-b border-ink/15 px-4 py-4">
              Address
            </td>
            {spaces.map((s) => (
              <td key={s.id} className="font-sans text-xs text-graphite border-b border-ink/15 px-4 py-4">
                {s.address ?? "—"}
              </td>
            ))}
          </tr>
          {allPlanTypes.map((plan) => (
            <tr key={plan}>
              <td className="font-sans text-[10px] uppercase tracking-[0.18em] text-graphite border-b border-ink/15 px-4 py-4">
                {plan}
              </td>
              {spaces.map((s) => (
                <td key={s.id} className="border-b border-ink/15 px-4 py-4">
                  {s.plan_types?.includes(plan) ? "✦" : "—"}
                </td>
              ))}
            </tr>
          ))}
          {allAmenities.map((amenity) => (
            <tr key={amenity}>
              <td className="font-sans text-[10px] uppercase tracking-[0.18em] text-graphite border-b border-ink/15 px-4 py-4">
                {amenity}
              </td>
              {spaces.map((s) => (
                <td key={s.id} className="border-b border-ink/15 px-4 py-4">
                  {s.amenities?.includes(amenity) ? "✦" : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
