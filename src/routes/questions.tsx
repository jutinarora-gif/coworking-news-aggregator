import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQuestions } from "@/lib/data.functions";
import { MessagesSquare, Sparkles, CornerDownRight, BadgeCheck, ClipboardCheck, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";

const q = queryOptions({ queryKey: ["questions"], queryFn: () => getQuestions() });

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Community Q&A , The Coworking Dispatch" },
      { name: "description", content: "Ask coworkers and founders. Real answers, real experience." },
      { property: "og:title", content: "Coworking Q&A and AMAs" },
      { property: "og:description", content: "Ask coworkers and founders. Real answers, real experience." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: QuestionsPage,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
});

function useHashHighlight() {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlighted(hash);
    const t = setTimeout(() => setHighlighted(null), 2500);
    return () => clearTimeout(t);
  }, []);
  return highlighted;
}

function QuestionsPage() {
  const { data } = useSuspenseQuery(q);
  const highlighted = useHashHighlight();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1"><MessagesSquare className="h-3.5 w-3.5" />Community</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Questions & AMAs</h1>
      <p className="mt-2 text-muted-foreground">Real coworkers. Real answers. No affiliate links.</p>

      {data.salesQuestions.length > 0 && (
        <section id="sales-checklist" className="mt-10 glass rounded-2xl p-5 md:p-6">
          <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" />Before you sign</div>
          <h2 className="mt-1 font-display text-2xl">Questions to ask the salesperson</h2>
          <ol className="mt-4 space-y-3">
            {data.salesQuestions.map((sq, i) => (
              <li
                key={sq.id}
                id={`sq-${sq.id}`}
                className={`text-sm flex gap-2.5 rounded-lg p-2 -mx-2 transition-colors duration-700 ${highlighted === `sq-${sq.id}` ? "bg-accent" : ""}`}
              >
                <span className="text-iris font-display text-lg leading-none shrink-0">{i + 1}.</span>
                <span>
                  {sq.text}
                  {sq.category && (
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground align-middle">{sq.category}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-10 space-y-4">
        {data.questions.map((qq) => (
          <QuestionItem key={qq.id} qq={qq} />
        ))}
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
        className="w-full text-left p-5 md:p-6 flex items-start gap-3 hover-glow hover:hover-glow-hover"
      >
        {qq.is_ama && (
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded gradient-iris text-primary-foreground shrink-0">
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
                  className="text-iris hover:underline"
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
            <div className="mt-4 space-y-3 border-l-2 border-iris/20 pl-4">
              {qq.answers.map((a: any) => (
                <div key={a.id} className="flex gap-2.5">
                  <CornerDownRight className="h-3.5 w-3.5 mt-1 text-iris/60 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{a.body}</p>
                    <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                      <span className="font-medium text-foreground/80">{a.author?.display_name ?? "Anonymous"}</span>
                      {a.is_founder_reply && (
                        <span className="inline-flex items-center gap-0.5 text-iris">
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
