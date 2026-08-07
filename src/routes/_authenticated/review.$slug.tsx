import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSpace, submitReview } from "@/lib/data.functions";
import { useState } from "react";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const q = (slug: string) => queryOptions({ queryKey: ["space", slug], queryFn: () => getSpace({ data: { slug } }) });

export const Route = createFileRoute("/_authenticated/review/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(q(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `Review ${loaderData.space.name} , The Coworking Dispatch` : "Leave a review" }],
  }),
  component: ReviewFormPage,
  notFoundComponent: () => <div className="p-16 text-center">Space not found</div>,
});

const SUB_RATINGS = [
  { key: "rating_wifi", label: "Wifi" },
  { key: "rating_quiet", label: "Quiet" },
  { key: "rating_community", label: "Community" },
  { key: "rating_coffee", label: "Coffee" },
  { key: "rating_value", label: "Value" },
] as const;

function StarPicker({ value, onChange, size = "h-7 w-7" }: { value: number; onChange: (v: number) => void; size?: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110">
          <Star className={`${size} ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewFormPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(q(slug));
  const navigate = useNavigate();
  const submitReviewFn = useServerFn(submitReview);

  const [overall, setOverall] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      submitReviewFn({
        data: {
          space_id: data!.space.id,
          rating_overall: overall,
          rating_wifi: subRatings.rating_wifi,
          rating_quiet: subRatings.rating_quiet,
          rating_community: subRatings.rating_community,
          rating_coffee: subRatings.rating_coffee,
          rating_value: subRatings.rating_value,
          title: title.trim() || undefined,
          body,
          pros: pros.trim() || undefined,
          cons: cons.trim() || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Review posted. Thanks for helping other coworkers.");
      navigate({ to: "/spaces/$slug", params: { slug } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!data) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/spaces/$slug" params={{ slug }} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" />Back to {data.space.name}
      </Link>
      <h1 className="mt-3 font-display text-3xl md:text-4xl">Review {data.space.name}</h1>
      <p className="mt-2 text-muted-foreground">Real experience only. This goes straight to the space's public review list.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (overall === 0) { toast.error("Pick an overall rating first."); return; }
          mut.mutate();
        }}
        className="mt-8 space-y-6"
      >
        <div className="glass rounded-2xl p-6">
          <Label className="text-xs uppercase tracking-widest text-iris">Overall rating</Label>
          <div className="mt-2"><StarPicker value={overall} onChange={setOverall} /></div>
        </div>

        <div className="glass rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
          {SUB_RATINGS.map(({ key, label }) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <div className="mt-1"><StarPicker value={subRatings[key] ?? 0} onChange={(v) => setSubRatings((s) => ({ ...s, [key]: v }))} size="h-5 w-5" /></div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum it up in a few words" maxLength={120} />
          </div>
          <div>
            <Label htmlFor="body">Your review</Label>
            <Textarea id="body" required minLength={20} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What was it actually like day to day?" rows={5} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pros">Pros (optional)</Label>
              <Textarea id="pros" value={pros} onChange={(e) => setPros(e.target.value)} rows={3} />
            </div>
            <div>
              <Label htmlFor="cons">Cons (optional)</Label>
              <Textarea id="cons" value={cons} onChange={(e) => setCons(e.target.value)} rows={3} />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={mut.isPending} className="w-full bg-flare text-flare-ink hover:bg-flare/90">
          {mut.isPending ? "Posting…" : "Post review"}
        </Button>
      </form>
    </div>
  );
}
