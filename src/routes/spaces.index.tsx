import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSpaces } from "@/lib/data.functions";
import { SpaceCard } from "@/components/site/space-card";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const q = queryOptions({ queryKey: ["spaces"], queryFn: () => getSpaces() });

export const Route = createFileRoute("/spaces/")({
  validateSearch: (s: Record<string, unknown>) => (typeof s.city === "string" ? { city: s.city } : {}),
  head: () => ({
    meta: [
      { title: "Coworking Spaces , The Coworking Dispatch" },
      { name: "description", content: "Browse India's coworking spaces with member reviews and structured ratings." },
      { property: "og:title", content: "Coworking Spaces across India" },
      { property: "og:description", content: "Member reviews. Structured ratings. Real spaces." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: SpacesPage,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

function SpacesPage() {
  const { data } = useSuspenseQuery(q);
  const { city: cityParam } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<"all" | "india" | "global">("all");
  const [city, setCity] = useState<string>(cityParam ?? "all");


  const cities = useMemo(() => Array.from(new Set(data.map((s) => s.city_name).filter(Boolean) as string[])).sort(), [data]);
  const filtered = data.filter((s) => {
    if (region !== "all" && s.city_region !== region) return false;
    if (city !== "all" && s.city_name !== city) return false;
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.city_name?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris">The directory</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Coworking spaces</h1>
      <p className="mt-2 text-muted-foreground">{data.length} spaces · {data.reduce((s, x) => s + x.review_count, 0)} reviews from real coworkers</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="glass rounded-xl px-3 flex items-center flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or city…" className="border-0 bg-transparent focus-visible:ring-0" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="inline-flex glass rounded-full p-1">
          {(["all","india","global"] as const).map((r) => (
            <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 rounded-full text-sm capitalize ${region === r ? "gradient-iris text-primary-foreground" : "text-muted-foreground"}`}>{r === "india" ? "🇮🇳" : r === "global" ? "🌏" : "All"}</button>
          ))}
        </div>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm bg-transparent">
          <option value="all">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => <SpaceCard key={s.id} s={s} />)}
      </div>
      {filtered.length === 0 && <div className="mt-16 text-center text-muted-foreground">No spaces match your filters.</div>}
    </div>
  );
}
