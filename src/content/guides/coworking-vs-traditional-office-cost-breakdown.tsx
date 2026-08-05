import { Link } from "@tanstack/react-router";
import { WhyThisMatters, Step, Tip, Closing, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        Founders usually compare rent versus a seat price and stop there. The real comparison has
        five or six line items on the traditional side that never show up in the broker's pitch.
      </WhyThisMatters>

      <Step n={1} title="Add up the real cost of a traditional lease, not just rent">
        <p>
          Rent is one line. Add the security deposit (often six to ten months in a lot of Indian
          markets), fit-out and furniture, an IT setup for wifi and networking, a maintenance or
          housekeeping hire, and the broker's fee. Most of this is invisible until you are three
          weeks into negotiating a lease.
        </p>
      </Step>

      <Step n={2} title="Coworking bundles most of that into one line item">
        <p>
          A coworking seat price already includes furniture, wifi, housekeeping, and usually
          reception and security. That is the entire appeal for a small team: one predictable
          monthly number instead of six separate vendors to manage.
        </p>
      </Step>

      <Step n={3} title="Work out your actual break-even team size">
        <p>
          As a rough rule, coworking tends to win on cost up to somewhere around fifteen to
          twenty five people, depending on the city and the quality of space you are comparing.
          Past that, a managed traditional office often starts costing less per seat, since the
          per-seat overhead of amenities gets diluted across more people.
        </p>
        <Tip>Ask two or three operators for a per-seat quote at your team size, then ask a broker for an all-in traditional cost at the same size. Compare the totals, not just rent.</Tip>
      </Step>

      <Step n={4} title="Price in the flexibility, not just the flexibility itself">
        <p>
          A traditional lease is usually a three to five year lock-in. If your headcount is
          uncertain, that lock-in has a real cost: either you overpay for empty seats, or you
          break the lease and eat the penalty. Coworking contracts are typically monthly to
          annual, which is worth something even if the sticker price looks higher.
        </p>
      </Step>

      <Step n={5} title="Check for coworking's own hidden costs">
        <p>
          Meeting room credits run out fast for client-facing teams. Printing, extra access
          cards, and day passes for visiting team members can add up. Ask for the full price
          list, not just the headline seat price, before you compare numbers.
        </p>
      </Step>

      <Step n={6} title="Compare a shortlist side by side">
        <p>
          Once you have real numbers from both sides, put them next to each other for a twelve
          month horizon, not a one month snapshot. Browse{" "}
          <Link to="/spaces" className="text-iris underline underline-offset-2">
            coworking spaces with pricing
          </Link>{" "}
          in your city to build the coworking side of the comparison quickly.
        </p>
      </Step>

      <Closing>
        Neither option is universally cheaper. It depends entirely on team size, how certain
        your headcount is, and how much you value not managing furniture and wifi vendors
        yourself.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/guides/$slug" params={{ slug: "how-to-choose-a-coworking-space" }}>
          How to choose a coworking space
        </RelatedLink>
        <RelatedLink to="/spaces">Browse spaces with pricing</RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "coworking-vs-traditional-office-cost-breakdown",
  title: "Coworking vs. traditional office",
  dek: "A real cost breakdown for small teams deciding between the two, not just rent versus seat price.",
  category: "coworkers",
  readMins: 5,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
