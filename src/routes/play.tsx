import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";
import { PageHeading } from "@/components/site/page-heading";
import { DeskHopGame } from "@/components/site/desk-hop-game";
import { canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Desk Hop , The Coworking Dispatch" },
      { name: "description", content: "A one-button arcade game. Hop desks, dodge printer jams, grab mint coins. No sign-up, no download." },
      { property: "og:title", content: "Desk Hop , The Coworking Dispatch" },
      { property: "og:description", content: "A one-button arcade game about coworking floor survival." },
    ],
    links: [canonicalLink("/play")],
  }),
  component: PlayPage,
});

function PlayPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <PageHeading
        eyebrow="Arcade"
        icon={<Gamepad2 className="h-3.5 w-3.5" />}
        title="Desk Hop"
        sub="Your desk is fine. The next one might not be. One button: jump."
      />
      <div className="mt-8">
        <DeskHopGame />
      </div>
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Space or ArrowUp to jump, P to pause. On mobile, tap to jump, hold a beat longer for a higher jump.
      </p>
    </div>
  );
}
