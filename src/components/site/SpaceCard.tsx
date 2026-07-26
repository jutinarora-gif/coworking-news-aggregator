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

export function SpaceCard({
  space,
  citySlug,
  selected,
  onToggle,
}: {
  space: CoworkingSpace;
  citySlug: string;
  selected?: boolean;
  onToggle?: (id: string) => void;
}) {
  return (
    <div className="border border-ink/15 p-6 flex flex-col gap-4">
      <div>
        <Link href={`/spaces/${citySlug}/${space.slug}`}>
          <h3 className="font-serif text-2xl leading-tight text-ink hover:text-terracotta transition-colors duration-300">
            {space.name}
          </h3>
        </Link>
        {space.address && (
          <p className="mt-1 font-sans text-xs text-graphite leading-relaxed">{space.address}</p>
        )}
      </div>

      <div className="font-sans text-sm text-ink">{formatPrice(space)}</div>

      {space.amenities && space.amenities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {space.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="font-sans text-[10px] uppercase tracking-[0.18em] text-graphite border border-ink/15 px-2 py-1"
            >
              {a}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-ink/15">
        <Link
          href={`/spaces/${citySlug}/${space.slug}`}
          className="editorial-link font-sans text-[11px] uppercase tracking-[0.22em] text-ink"
        >
          View details →
        </Link>
        {onToggle && (
          <label className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.18em] text-graphite cursor-pointer">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onToggle(space.id)}
              className="accent-ink"
            />
            Compare
          </label>
        )}
      </div>
    </div>
  );
}
