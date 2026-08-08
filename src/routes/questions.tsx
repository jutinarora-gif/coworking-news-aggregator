import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQuestions } from "@/lib/data.functions";
import { MessagesSquare, Sparkles, CornerDownRight, BadgeCheck, ChevronDown, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useRef, useState } from "react";
import { canonicalLink } from "@/lib/seo";

const q = queryOptions({ queryKey: ["questions"], queryFn: () => getQuestions() });

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Community Q&A , The Coworking Dispatch" },
      { name: "description", content: "Ask coworkers and founders. Practical answers, no affiliate links." },
      { property: "og:title", content: "Coworking Q&A and AMAs" },
      { property: "og:description", content: "Ask coworkers and founders. Practical answers, no affiliate links." },
    ],
    links: [canonicalLink("/questions")],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: QuestionsPage,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

function locality(qq: any): string | null {
  // Space address is stored as "Area, City" (e.g. "Koramangala, Bangalore") — take the area part.
  const addr = qq.space?.address as string | undefined;
  if (!addr) return null;
  const [area] = addr.split(",");
  return area?.trim() || null;
}

function QuestionsPage() {
  const { data } = useSuspenseQuery(q);
  const [city, setCity] = useState("all");
  const [area, setArea] = useState("all");

  const cities = useMemo(
    () => Array.from(new Set(data.questions.map((qq) => qq.city_name).filter(Boolean) as string[])).sort(),
    [data.questions],
  );
  const areas = useMemo(() => {
    const relevant = city === "all" ? data.questions : data.questions.filter((qq) => qq.city_name === city);
    return Array.from(new Set(relevant.map(locality).filter(Boolean) as string[])).sort();
  }, [data.questions, city]);

  const filtered = data.questions.filter((qq) => {
    if (city !== "all" && qq.city_name !== city) return false;
    if (area !== "all" && locality(qq) !== area) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" /><MessagesSquare className="h-3.5 w-3.5" />Community</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Questions & AMAs</h1>
      <p className="mt-2 text-muted-foreground">Ask, answer, compare notes. No affiliate links.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />Filter by
        </div>
        <select
          value={city}
          onChange={(e) => { setCity(e.target.value); setArea("all"); }}
          className="glass rounded-xl px-3 py-2 text-sm bg-transparent"
        >
          <option value="all">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-sm bg-transparent"
          disabled={areas.length === 0}
        >
          <option value="all">All locations</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        {(city !== "all" || area !== "all") && (
          <button
            onClick={() => { setCity("all"); setArea("all"); }}
            className="text-xs text-muted-foreground hover:text-primary underline"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {data.questions.length}</span>
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map((qq) => (
          <QuestionItem key={qq.id} qq={qq} />
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No questions match this filter yet.</div>
        )}
      </div>
    </div>
  );
}

function QuestionItem({ qq }: { qq: any }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left p-5 md:p-6 flex items-start gap-3 ${open ? "" : "hover-glow hover:hover-glow-hover"}`}
      >
        {qq.is_ama && (
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-flare text-flare-ink shrink-0">
            <Sparkles className="h-3 w-3" />AMA
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl">{qq.title}</h3>
          <div className="mt-1 text-xs text-muted-foreground">
            {qq.author?.display_name} · {formatDistanceToNow(new Date(qq.created_at), { addSuffix: true })}
            {qq.space && (
              <>
                {" · "}
                <Link
                  to="/spaces/$slug"
                  params={{ slug: qq.space.slug }}
                  onClick={(e) => e.stopPropagation()}
                  className="acid-underline hover:acid-underline-hover font-medium text-foreground"
                >
                  {qq.space.name}
                </Link>
              </>
            )}
            {" · "}
            {qq.answer_count} {qq.answer_count === 1 ? "answer" : "answers"}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 mt-1 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div ref={contentRef} className="px-5 md:px-6 pb-5 md:pb-6 -mt-2">
          {qq.body && <p className="text-sm text-muted-foreground">{qq.body}</p>}

          {qq.answers.length > 0 && (
            <div className="mt-4 space-y-3 border-l-2 border-[var(--flare)] pl-4">
              {qq.answers.map((a: any) => (
                <div key={a.id} className="flex gap-2.5">
                  <CornerDownRight className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{a.body}</p>
                    <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                      <span className="font-medium text-foreground/80">{a.author?.display_name ?? "Anonymous"}</span>
                      {a.is_founder_reply && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-flare px-1.5 text-flare-ink">
                          <BadgeCheck className="h-3 w-3" />founder
                        </span>
                      )}
                      <span>· {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {qq.answers.length === 0 && (
            <div className="mt-3 text-xs text-muted-foreground">No answers yet. Be the first.</div>
          )}
        </div>
      )}
    </div>
  );
}
