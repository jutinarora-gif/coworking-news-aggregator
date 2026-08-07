import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCities, getMySpaceSubmissions, submitSpace } from "@/lib/data.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, Clock } from "lucide-react";

const citiesQ = queryOptions({ queryKey: ["cities"], queryFn: () => getCities() });
const mineQ = queryOptions({ queryKey: ["my-space-submissions"], queryFn: () => getMySpaceSubmissions() });

export const Route = createFileRoute("/_authenticated/submit-space")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(citiesQ),
      context.queryClient.ensureQueryData(mineQ),
    ]);
  },
  head: () => ({ meta: [{ title: "Submit a space , The Coworking Dispatch" }] }),
  component: SubmitSpacePage,
});

function SubmitSpacePage() {
  const { data: cities } = useSuspenseQuery(citiesQ);
  const { data: mine } = useSuspenseQuery(mineQ);
  const queryClient = useQueryClient();
  const submitSpaceFn = useServerFn(submitSpace);

  const [name, setName] = useState("");
  const [cityId, setCityId] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [vibeTags, setVibeTags] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      submitSpaceFn({
        data: {
          name,
          city_id: cityId,
          address: address.trim() || undefined,
          description,
          website_url: websiteUrl.trim() || undefined,
          price_from: priceFrom ? Number(priceFrom) : undefined,
          vibe_tags: vibeTags.split(",").map((t) => t.trim()).filter(Boolean),
        },
      }),
    onSuccess: () => {
      toast.success("Submitted! We'll review it and it'll go live automatically once approved.");
      setName(""); setCityId(""); setAddress(""); setDescription(""); setWebsiteUrl(""); setPriceFrom(""); setVibeTags("");
      queryClient.invalidateQueries({ queryKey: ["my-space-submissions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris">Submit a space</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">List a coworking space</h1>
      <p className="mt-3 text-muted-foreground">
        Know a space we're missing? Fill this in and we'll review it. Once approved, it's listed automatically —
        no extra step on your end.
      </p>

      {mine.length > 0 && (
        <div className="mt-8 glass rounded-2xl p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Your submissions</div>
          <ul className="space-y-2">
            {mine.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                {s.is_published ? (
                  <span className="inline-flex items-center gap-1 text-xs text-iris"><CheckCircle2 className="h-3.5 w-3.5" />Live</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />Pending review</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!cityId) { toast.error("Please select a city."); return; }
          mut.mutate();
        }}
        className="mt-8 space-y-4"
      >
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <Label htmlFor="name">Space name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. WeWork Galaxy" />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <select
              id="city"
              required
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="mt-1 w-full glass rounded-xl px-3 py-2 text-sm bg-transparent"
            >
              <option value="">Select a city…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="address">Address (optional)</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Area, landmark, or full address" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required minLength={20} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's it like? Size, vibe, who it suits best." rows={4} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Website (optional)</Label>
              <Input id="website" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label htmlFor="price">Starting price (optional)</Label>
              <Input id="price" type="number" min={0} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="e.g. 8000" />
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Vibe tags (optional, comma separated)</Label>
            <Input id="tags" value={vibeTags} onChange={(e) => setVibeTags(e.target.value)} placeholder="quiet, startup-friendly, great coffee" />
          </div>
        </div>

        <Button type="submit" disabled={mut.isPending} className="w-full bg-flare text-flare-ink hover:bg-flare/90">
          {mut.isPending ? "Submitting…" : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
