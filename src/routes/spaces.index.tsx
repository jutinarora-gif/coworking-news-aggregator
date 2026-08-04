import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSpaces } from "@/lib/data.functions";
import { SpaceCard } from "@/components/site/space-card";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronsUpDown, Check, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CityFilter({ cities, value, onChange }: { cities: { name: string; count: number }[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const label = value === "all" ? "All cities" : value;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="glass rounded-xl px-3 justify-between font-normal text-sm min-w-[160px]">
          <span className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search cities…" />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="all" onSelect={() => { onChange("all"); setOpen(false); }}>
                <Check className={cn("mr-2 h-4 w-4", value === "all" ? "opacity-100" : "opacity-0")} />
                All cities
              </CommandItem>
              {cities.map((c) => (
                <CommandItem key={c.name} value={c.name} onSelect={() => { onChange(c.name); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === c.name ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.count}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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


  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of data) {
      if (region !== "all" && s.city_region !== region) continue;
      if (!s.city_name) continue;
      counts.set(s.city_name, (counts.get(s.city_name) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, region]);
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
        <div className="glass rounded-xl px-3 flex items-center flex-1 min-w-[240px] overflow-hidden">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or city…" className="border-0 bg-transparent shadow-none focus-visible:ring-0" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="inline-flex glass rounded-full p-1">
          {(["all","india","global"] as const).map((r) => (
            <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 rounded-full text-sm capitalize ${region === r ? "gradient-iris text-primary-foreground" : "text-muted-foreground"}`}>{r === "india" ? "🇮🇳" : r === "global" ? "🌏" : "All"}</button>
          ))}
        </div>
        <CityFilter cities={cities} value={city} onChange={setCity} />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => <SpaceCard key={s.id} s={s} />)}
      </div>
      {filtered.length === 0 && <div className="mt-16 text-center text-muted-foreground">No spaces match your filters.</div>}
    </div>
  );
}
