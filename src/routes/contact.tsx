import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact , The Coworking Dispatch" },
      { name: "description", content: "Get in touch with The Coworking Dispatch team." },
      { property: "og:title", content: "Contact The Coworking Dispatch" },
      { property: "og:description", content: "Get in touch with The Coworking Dispatch team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-iris">Contact</div>
      <h1 className="mt-1 font-display text-4xl md:text-5xl">Get in touch</h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        Found a coworking space we've got wrong, want to suggest a news source, or just have feedback on the
        site? We read everything that comes in.
      </p>

      <div className="mt-8 glass-strong rounded-2xl p-6 md:p-8 flex items-center gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl gradient-iris flex items-center justify-center">
          <Mail className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Email us</div>
          <a href="mailto:info@coworkingdispatch.com" className="mt-1 block font-display text-xl text-iris hover:underline">
            info@coworkingdispatch.com
          </a>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg">Space owners</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Want to claim or correct your listing? Email us the space name and city and we'll get it sorted.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg">Press &amp; partnerships</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            For media inquiries or partnership ideas, reach out at the same address above.
          </p>
        </div>
      </div>
    </div>
  );
}
