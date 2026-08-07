import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, ArrowRight } from "lucide-react";

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

function RoleCard({ role }: { role: Role }) {
  const subject = encodeURIComponent(`Application: ${role.title}`);
  return (
    <div className="rounded-2xl border border-border/60 p-5 flex flex-col">
      <div className="font-display text-lg">{role.title}</div>
      <div className="mt-1 text-sm font-medium text-iris">{role.salary}</div>
      <p className="mt-2 text-sm text-muted-foreground flex-1">{role.blurb}</p>
      <a
        href={`mailto:info@coworkingdispatch.com?subject=${subject}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-iris hover:underline underline-offset-2 w-fit"
      >
        Apply <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function CareersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris flex items-center gap-1">
        <Briefcase className="h-3.5 w-3.5" /> Careers
      </div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Open positions</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        We're a small team building India's coworking news, reviews, and community platform.
        Email us with the role in the subject line, we read every application ourselves.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => <RoleCard key={role.title} role={role} />)}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Don't see a fit but think you'd still be useful here? Write to us at{" "}
        <a href="mailto:info@coworkingdispatch.com" className="text-iris hover:underline underline-offset-2">
          info@coworkingdispatch.com
        </a>
        .
      </p>
    </div>
  );
}
