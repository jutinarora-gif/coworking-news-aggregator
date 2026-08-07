import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitJobApplication } from "@/lib/data.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers , The Coworking Dispatch" },
      { name: "description", content: "Open roles at The Coworking Dispatch. Join the team building India's coworking news, reviews, and community platform." },
      { property: "og:title", content: "Careers at The Coworking Dispatch" },
      { property: "og:description", content: "Open roles at The Coworking Dispatch." },
    ],
  }),
  component: CareersPage,
});

type Role = { title: string; salary: string; blurb: string };

const ROLES: Role[] = [
  { title: "Content Lead", salary: "15-18 LPA", blurb: "Own the editorial calendar, dispatch quality, and the voice behind our news coverage and guides." },
  { title: "SEO Manager", salary: "12-14 LPA", blurb: "Own organic strategy across spaces, dispatches, and guides, from technical SEO to content structure." },
  { title: "SEO Executive", salary: "8-10 LPA", blurb: "Execute on-page and off-page SEO work, keyword research, and reporting under the SEO Manager." },
  { title: "Graphics Designer", salary: "12-14 LPA", blurb: "Design visual assets across the site, social, and email, and help keep the brand consistent as it grows." },
  { title: "SDE III", salary: "12-14 LPA", blurb: "Senior engineer on the core platform, owning features end to end across the stack." },
  { title: "Talent Acquisition Manager", salary: "10-12 LPA", blurb: "Own hiring for the growing team, from sourcing to closing, across tech and non-tech roles." },
];

function ApplicationDialog({ role, open, onOpenChange }: { role: Role | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [message, setMessage] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPortfolioUrl("");
    setMessage("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      submitJobApplication({
        data: { role: role?.title ?? "", name, email, phone, portfolio_url: portfolioUrl, message },
      }),
    onSuccess: () => {
      toast.success("Application sent", { description: "We read every application ourselves, we'll be in touch." });
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error("Couldn't submit", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply: {role?.title}</DialogTitle>
          <DialogDescription>Tell us a bit about yourself. We read every application ourselves.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="portfolio">Portfolio / LinkedIn / Resume link (optional)</Label>
            <Input id="portfolio" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Why this role? (optional)</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md gradient-iris text-primary-foreground font-medium disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit application
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleCard({ role, onApply }: { role: Role; onApply: (role: Role) => void }) {
  return (
    <div className="rounded-2xl border border-border/60 p-5 flex flex-col">
      <div className="font-display text-lg">{role.title}</div>
      <div className="mt-1 text-sm font-medium text-iris">{role.salary}</div>
      <p className="mt-2 text-sm text-muted-foreground flex-1">{role.blurb}</p>
      <button
        onClick={() => onApply(role)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-iris hover:underline underline-offset-2 w-fit"
      >
        Apply <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CareersPage() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [open, setOpen] = useState(false);

  const handleApply = (role: Role) => {
    setActiveRole(role);
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1">
        <Briefcase className="h-3.5 w-3.5" /> Careers
      </div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Open positions</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        We're a small team building India's coworking news, reviews, and community platform.
        Apply below, we read every application ourselves.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => <RoleCard key={role.title} role={role} onApply={handleApply} />)}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Don't see a fit but think you'd still be useful here? Write to us at{" "}
        <a href="mailto:info@coworkingdispatch.com" className="text-iris hover:underline underline-offset-2">
          info@coworkingdispatch.com
        </a>
        .
      </p>

      <ApplicationDialog role={activeRole} open={open} onOpenChange={setOpen} />
    </div>
  );
}
