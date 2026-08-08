import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { approveSpace, getPendingSpaces, rejectSpace } from "@/lib/data.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

const q = queryOptions({ queryKey: ["pending-spaces"], queryFn: () => getPendingSpaces() });

export const Route = createFileRoute("/_authenticated/admin/spaces")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({ meta: [{ title: "Pending spaces , Admin" }] }),
  component: AdminSpacesPage,
});

function AdminSpacesPage() {
  const { data } = useSuspenseQuery(q);
  const queryClient = useQueryClient();
  const approveFn = useServerFn(approveSpace);
  const rejectFn = useServerFn(rejectSpace);

  const approve = useMutation({
    mutationFn: (space_id: string) => approveFn({ data: { space_id } }),
    onSuccess: () => {
      toast.success("Approved, now live.");
      queryClient.invalidateQueries({ queryKey: ["pending-spaces"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: (space_id: string) => rejectFn({ data: { space_id } }),
    onSuccess: () => {
      toast.success("Rejected and removed.");
      queryClient.invalidateQueries({ queryKey: ["pending-spaces"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris">Admin</div>
      <h1 className="mt-1 font-display text-4xl">Pending space submissions</h1>
      <p className="mt-2 text-muted-foreground">
        {data.length === 0 ? "Nothing waiting for review." : `${data.length} submission${data.length === 1 ? "" : "s"} waiting for review.`}
      </p>

      <div className="mt-8 space-y-4">
        {data.map((s) => (
          <div key={s.id} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-xl">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.city_name}{s.address ? ` · ${s.address}` : ""}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => approve.mutate(s.id)} disabled={approve.isPending || reject.isPending} className="bg-flare text-flare-ink hover:bg-flare/90">
                  <Check className="h-4 w-4 mr-1" />Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => reject.mutate(s.id)} disabled={approve.isPending || reject.isPending}>
                  <X className="h-4 w-4 mr-1" />Reject
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {s.website_url && <a href={s.website_url} target="_blank" rel="noreferrer" className="text-iris hover:underline">{s.website_url}</a>}
              {s.price_from != null && <span>From {s.currency} {s.price_from}</span>}
              {(s.vibe_tags ?? []).length > 0 && <span>{(s.vibe_tags ?? []).join(", ")}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
