import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Nobody hands out a rulebook on your first day. Most coworking friction comes from small,
        unspoken habits, not big violations, and getting them right early is what makes a space
        feel comfortable instead of tense.
      </WhyThisMatters>

      <Step n={1} title="Calls belong in booths, not at the hot desk">
        <p>
          A five-minute call at your desk feels harmless in the moment, but it's the single most
          reported annoyance in coworking reviews. If a phone booth is free, use it, even for
          "quick" calls.
        </p>
      </Step>

      <Step n={2} title="Book meeting rooms you'll actually use, and cancel the ones you won't">
        <p>
          Rooms sit empty because people book "just in case" and forget to release the slot. Most
          spaces track no-shows, and it's the fastest way to become the person the front desk
          quietly complains about.
        </p>
      </Step>

      <Step n={3} title="Clean up food smells and dishes without being asked">
        <p>
          Shared pantries are a common friction point. Strong food smells at a hot desk, and dishes
          left in the sink overnight, are two of the fastest ways to annoy an entire floor.
        </p>
        <Tip>If you're not sure whether a smell is "too much," it probably is. Eat it in the pantry, not at your desk.</Tip>
      </Step>

      <Step n={4} title="Guests check in, they don't tailgate">
        <p>
          Letting an unregistered guest in behind you might feel like a small favor, but most
          spaces track occupancy and security this way. Send them to reception, it takes thirty
          seconds and keeps the space accountable.
        </p>
      </Step>

      <Step n={5} title="Headphones on doesn't mean invisible">
        <p>
          Loud typing, speakerphone audio leaking through headphones, and drumming on the desk are
          all still audible to your neighbors. If you wouldn't do it in a library, don't do it at
          a quiet-zone desk.
        </p>
      </Step>

      <Step n={6} title="Introduce yourself before you need something">
        <p>
          The members who get help fastest when something goes wrong are usually the ones who
          said hello in the pantry first. A coworking space runs on small social capital more than
          most people expect.
        </p>
      </Step>

      <Closing>
        None of this is written down anywhere, which is exactly why it's worth knowing before you
        walk in on day one. Most of it comes down to treating shared space like it's actually
        shared.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/guides/$slug" params={{ slug: "how-to-choose-a-coworking-space" }}>
          How to choose a coworking space
        </RelatedLink>
        <RelatedLink to="/questions">See what coworkers ask before joining</RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "coworking-etiquette-unwritten-rules",
  title: "Coworking etiquette",
  dek: "The unwritten rules of sharing a workspace with strangers, learned the easy way instead of the hard way.",
  category: "coworkers",
  readMins: 5,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
