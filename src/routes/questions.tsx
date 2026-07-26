import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQuestions } from "@/lib/data.functions";
import { MessagesSquare, Sparkles, CornerDownRight, BadgeCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

function QuestionsPage() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1"><MessagesSquare className="h-3.5 w-3.5" />Community</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Questions & AMAs</h1>
      <p className="mt-2 text-muted-foreground">Real coworkers. Real answers. No affiliate links.</p>
      <div className="mt-10 space-y-4">
        {data.map((qq) => (
          <div key={qq.id} className="glass rounded-2xl p-5 md:p-6 hover-glow hover:hover-glow-hover">
            <div className="flex items-start gap-3">
              {qq.is_ama && (
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded gradient-iris text-primary-foreground">
                  <Sparkles className="h-3 w-3" />AMA
                </span>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl">{qq.title}</h3>
                <div className="mt-1 text-xs text-muted-foreground">
                  {qq.author?.display_name} · {formatDistanceToNow(new Date(qq.created_at), { addSuffix: true })}
                  {qq.space && <> · <Link to="/spaces/$slug" params={{ slug: qq.space.slug }} className="text-iris hover:underline">{qq.space.name}</Link></>}
                </div>
                {qq.body && <p className="mt-2 text-sm text-muted-foreground">{qq.body}</p>}

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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
