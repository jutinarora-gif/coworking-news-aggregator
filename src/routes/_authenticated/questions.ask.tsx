import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { submitQuestion } from "@/lib/data.functions";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/questions/ask")({
  head: () => ({ meta: [{ title: "Ask a question , The Coworking Dispatch" }] }),
  component: AskQuestionPage,
});

function AskQuestionPage() {
  const navigate = useNavigate();
  const submitQuestionFn = useServerFn(submitQuestion);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const mut = useMutation({
    mutationFn: () => submitQuestionFn({ data: { title, body: body.trim() || undefined } }),
    onSuccess: () => {
      toast.success("Question posted.");
      navigate({ to: "/questions" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/questions" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" />Back to Q&amp;A
      </Link>
      <h1 className="mt-3 font-display text-3xl md:text-4xl">Ask a question</h1>
      <p className="mt-2 text-muted-foreground">Ask coworkers and founders. Goes straight to the public Q&amp;A.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim().length < 10) { toast.error("Give your question a bit more detail."); return; }
          mut.mutate();
        }}
        className="mt-8 space-y-6"
      >
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <Label htmlFor="title">Your question</Label>
            <Input id="title" required minLength={10} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Does anyone know if X space allows dogs?" maxLength={150} />
          </div>
          <div>
            <Label htmlFor="body">More detail (optional)</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Any context that helps someone answer" rows={4} />
          </div>
        </div>

        <Button type="submit" disabled={mut.isPending} className="w-full bg-flare text-flare-ink hover:bg-flare/90">
          {mut.isPending ? "Posting…" : "Post question"}
        </Button>
      </form>
    </div>
  );
}
