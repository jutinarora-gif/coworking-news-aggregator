import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSpaces, getPriceIntel } from "@/lib/data.functions";
import { SpaceCard } from "@/components/site/space-card";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { canonicalLink } from "@/lib/seo";
import { Search, ChevronsUpDown, Check, MapPin, IndianRupee } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/site/page-heading";
import { cn } from "@/lib/utils";

const priceIntelQuery = queryOptions({ queryKey: ["price-intel"], queryFn: () => getPriceIntel() });

function fmtPrice(currency: string, n: number) {
  return `${currency === "INR" ? "₹" : "$"}${n.toLocaleString()}`;
}

function PriceBands() {
  const { data: allBands } = useSuspenseQuery(priceIntelQuery);
  const [expanded, setExpanded] = useState(false);
  // A shared axis only makes sense within one currency - mixing raw INR and
  // USD/EUR/SGD numbers on one bar scale would visually imply a comparison
  // that isn't real without a currency conversion we're not going to fake.
  const data = allBands.filter((b) => b.currency === "INR");
  const globalMax = data.length ? Math.max(...data.map((b) => b.max)) : 0;
  const shown = expanded ? data : data.slice(0, 8);

  if (!data.length) return null;

  return (
    <section className="mt-8 glass rounded-2xl p-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />
        <IndianRupee className="h-3.5 w-3.5" />Price intelligence
      </div>
      <h2 className="mt-1 font-display text-2xl">What a hot desk actually costs, by city</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Median, and the full range, from the spaces listed on this site — not asking prices, listed prices. India only; global cities price in local currency and aren't shown on this shared scale.
      </p>
      <div className="mt-6 space-y-4">
        {shown.map((b) => (
          <div key={b.city_name}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{b.city_name}</span>
              <span className="text-xs text-muted-foreground">
                {fmtPrice(b.currency, b.min)} – {fmtPrice(b.currency, b.max)} · median {fmtPrice(b.currency, b.median)} · {b.count} spaces
              </span>
            </div>
            <div className="mt-1.5 relative h-2 rounded-full bg-muted">
              <div
                className="absolute h-2 rounded-full bg-foreground/25"
                style={{ left: `${(b.min / globalMax) * 100}%`, width: `${((b.max - b.min) / globalMax) * 100}%` }}
              />
              <div className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-flare" style={{ left: `${(b.median / globalMax) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      {data.length > 8 && (
        <button onClick={() => setExpanded((v) => !v)} className="mt-4 text-sm font-medium hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">
          {expanded ? "Show fewer cities" : `Show all ${data.length} cities`}
        </button>
      )}
    </section>
  );
}

function CityFilter({ cities, value, onChange }: { cities: { name: string; count: number }[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const label = value === "all" ? "All cities" : value;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="glass rounded-full px-4 justify-between font-normal text-sm min-w-[160px]">
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
      { name: "description", content: "Browse India's coworking spaces with real prices, amenities, and locations." },
      { property: "og:title", content: "Coworking Spaces across India" },
      { property: "og:description", content: "Real prices. Real locations. No paid placement." },
    ],
    links: [canonicalLink("/spaces")],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(q),
      context.queryClient.ensureQueryData(priceIntelQuery),
    ]),
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
      <PageHeading
        eyebrow="The directory"
        title="Coworking spaces"
        sub={`${data.length} spaces, with real prices, amenities, and locations`}
      />

      <PriceBands />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="glass rounded-full px-4 flex items-center flex-1 min-w-[240px] focus-within:border-flare transition-colors">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or city…" className="border-0 bg-transparent shadow-none focus-visible:ring-0" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="inline-flex glass rounded-full p-1">
          {(["all","india","global"] as const).map((r) => (
            <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 rounded-full text-sm capitalize ${region === r ? "bg-flare text-flare-ink" : "text-muted-foreground"}`}>{r === "india" ? "🇮🇳" : r === "global" ? "🌏" : "All"}</button>
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
