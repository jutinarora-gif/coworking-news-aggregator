"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SpaceCard } from "@/components/site/SpaceCard";
import type { CoworkingSpace } from "@/lib/types";

export function SpaceGrid({ spaces, citySlug }: { spaces: CoworkingSpace[]; citySlug: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            citySlug={citySlug}
            selected={selected.includes(space.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-ink text-paper px-6 py-4 flex items-center justify-between">
          <span className="font-sans text-xs uppercase tracking-[0.18em]">
            {selected.length} selected
          </span>
          <button
            onClick={() => router.push(`/compare?ids=${selected.join(",")}`)}
            disabled={selected.length < 2}
            className="px-5 py-2 border border-paper font-sans text-[11px] uppercase tracking-[0.22em] disabled:opacity-40"
          >
            Compare →
          </button>
        </div>
      )}
    </div>
  );
}
