import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your Dashboard , The Coworking Dispatch" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); }, []);
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-xs uppercase tracking-widest text-iris">Your dashboard</div>
      <h1 className="font-display text-4xl mt-1">Welcome{session?.user?.email ? `, ${session.user.email.split("@")[0]}` : ""}</h1>
      <p className="mt-2 text-muted-foreground">More coming soon: your reviews, saved spaces, and question threads.</p>
      <Button className="mt-6" variant="secondary" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>Sign out</Button>
    </div>
  );
}
