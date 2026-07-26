import type { Metadata } from "next";
import { getSpacesByIds } from "@/lib/queries";
import { CompareTable } from "@/components/site/CompareTable";

export const metadata: Metadata = {
  title: "Compare Coworking Spaces",
  robots: { index: false },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean) : [];
  const spaces = await getSpacesByIds(idList);

  return (
    <main className="flex-1">
      <div className="border-b border-ink/15 px-6 sm:px-10 lg:px-14 py-14">
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-terracotta">
          Compare
        </span>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl leading-[1] tracking-tight text-ink">
          Coworking spaces
        </h1>
      </div>

      <div className="px-6 sm:px-10 lg:px-14 py-10">
        {spaces.length > 0 ? (
          <CompareTable spaces={spaces} />
        ) : (
          <p className="font-sans text-sm text-graphite">
            No spaces selected. Go to a city page and pick a few to compare.
          </p>
        )}
      </div>
    </main>
  );
}
