import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Briefcase, ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { submitJobApplication } from "@/lib/data.functions";
import { canonicalLink } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { PageHeading } from "@/components/site/page-heading";
import { Button } from "@/components/ui/button";
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
    links: [canonicalLink("/careers")],
  }),
  component: CareersPage,
});

type Role = { title: string; salary: string; location: string; type: string; blurb: string };

const ROLES: Role[] = [
  { title: "Content Lead", salary: "15-18 LPA", location: "Gurgaon", type: "Full-time", blurb: "Own the editorial calendar, dispatch quality, and the voice behind our news coverage and guides." },
  { title: "SEO Manager", salary: "12-14 LPA", location: "Gurgaon", type: "Full-time", blurb: "Own organic strategy across spaces, dispatches, and guides, from technical SEO to content structure." },
  { title: "SEO Executive", salary: "8-10 LPA", location: "Gurgaon", type: "Full-time", blurb: "Execute on-page and off-page SEO work, keyword research, and reporting under the SEO Manager." },
  { title: "Graphics Designer", salary: "12-14 LPA", location: "Gurgaon", type: "Full-time", blurb: "Design visual assets across the site, social, and email, and help keep the brand consistent as it grows." },
  { title: "SDE III", salary: "12-14 LPA", location: "Gurgaon", type: "Full-time", blurb: "Senior engineer on the core platform, owning features end to end across the stack." },
  { title: "Talent Acquisition Manager", salary: "10-12 LPA", location: "Gurgaon", type: "Full-time", blurb: "Own hiring for the growing team, from sourcing to closing, across tech and non-tech roles." },
];

function ApplicationDialog({ role, open, onOpenChange }: { role: Role | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [message, setMessage] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPortfolioUrl("");
    setMessage("");
    setCurrentCtc("");
    setExpectedCtc("");
    setNoticePeriod("");
    setResumeFile(null);
  };

  const MAX_RESUME_BYTES = 5 * 1024 * 1024;

  const mutation = useMutation({
    mutationFn: async () => {
      let resumePath: string | undefined;
      if (resumeFile) {
        if (resumeFile.size > MAX_RESUME_BYTES) throw new Error("Resume must be under 5 MB.");
        const ext = resumeFile.name.split(".").pop() || "pdf";
        const path = `${role?.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("resumes").upload(path, resumeFile);
        if (uploadError) throw new Error(`Resume upload failed: ${uploadError.message}`);
        resumePath = path;
      }
      return submitJobApplication({
        data: {
          role: role?.title ?? "",
          name,
          email,
          phone,
          portfolio_url: portfolioUrl,
          message,
          current_ctc: currentCtc,
          expected_ctc: expectedCtc,
          notice_period: noticePeriod,
          resume_path: resumePath,
        },
      });
    },
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
            <Label htmlFor="portfolio">Portfolio / LinkedIn link (optional)</Label>
            <Input id="portfolio" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resume">Resume / CV (optional, PDF or DOC, max 5 MB)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-ctc">Current CTC (optional)</Label>
              <Input id="current-ctc" value={currentCtc} onChange={(e) => setCurrentCtc(e.target.value)} placeholder="e.g. 12 LPA" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expected-ctc">Expected CTC (optional)</Label>
              <Input id="expected-ctc" value={expectedCtc} onChange={(e) => setExpectedCtc(e.target.value)} placeholder="e.g. 15 LPA" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-period">Notice period (optional)</Label>
            <Input id="notice-period" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} placeholder="e.g. 30 days" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Why this role? (optional)</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" variant="mint" disabled={mutation.isPending} className="disabled:opacity-60">
              {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleCard({ role, onApply }: { role: Role; onApply: (role: Role) => void }) {
  return (
    <li className="glass rounded-2xl p-5 hover-glow hover:hover-glow-hover flex flex-col">
      <div className="font-display text-lg leading-tight">{role.title}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        {role.salary} · {role.location} · {role.type}
      </div>
      <p className="mt-3 text-sm text-muted-foreground flex-1">{role.blurb}</p>
      <button
        onClick={() => onApply(role)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4 w-fit"
      >
        Apply <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </li>
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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <PageHeading
        eyebrow="Work with us"
        icon={<Briefcase className="h-3.5 w-3.5" />}
        title="Careers"
        sub="We're a small team building India's coworking news, reviews, and community platform. Apply below, we read every application ourselves."
        right={
          <Button asChild variant="mint">
            <a href="mailto:info@coworkingdispatch.com">
              <Mail className="mr-1 h-4 w-4" /> Send an intro
            </a>
          </Button>
        }
      />

      <section className="mt-12">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="acid-dot inline-block h-1.5 w-1.5 rounded-full" />
          Open roles
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role) => <RoleCard key={role.title} role={role} onApply={handleApply} />)}
        </ul>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        Don't see a fit but think you'd still be useful here? Write to us at{" "}
        <a href="mailto:info@coworkingdispatch.com" className="font-medium hover:underline hover:decoration-[var(--flare)] hover:decoration-2 hover:underline-offset-4">
          info@coworkingdispatch.com
        </a>
        .
      </p>

      <ApplicationDialog role={activeRole} open={open} onOpenChange={setOpen} />
    </div>
  );
}
