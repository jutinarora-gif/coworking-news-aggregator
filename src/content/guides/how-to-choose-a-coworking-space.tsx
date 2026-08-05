import { Link } from "@tanstack/react-router";
import { H2, P, UL, Callout } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <P>
        Most people choose a coworking space the way they choose a restaurant on holiday: they
        walk in, like the look of the place, and sign up. That works out fine sometimes. Other
        times you are stuck in a six month contract with wifi that drops every video call.
      </P>
      <P>
        Here is a more useful way to go about it, in the order that actually matters.
      </P>

      <H2>1. Start with your actual work pattern, not the brochure</H2>
      <P>
        Before you look at a single space, write down how your team actually works. How many
        days a week will people show up. Do you need calls all day or heads-down focus time. Is
        it one person or a team of eight that needs to sit together.
      </P>
      <P>
        A hot desk plan makes sense for two or three days a week. A dedicated desk or private
        cabin makes more sense if your team is in five days a week, since the per-day cost drops
        quite a bit once you cross that line.
      </P>

      <H2>2. Location matters more than the photos</H2>
      <P>
        A space can look stunning in photos and still be a bad pick if it adds forty five minutes
        to everyone's commute. Do the commute test before anything else: get directions from
        where your actual team lives, not just from your own house.
      </P>
      <P>
        If your team is spread across a city, look for something near a metro line or a major
        junction rather than the cheapest option in a far corner.
      </P>

      <H2>3. Test the wifi and noise yourself, do not just take the tour's word for it</H2>
      <P>
        Sales tours happen at quiet hours, usually late morning after the rush and before lunch.
        If you can, visit at a different time, say 3pm on a Tuesday, and see what the space
        actually feels like when it is full.
      </P>
      <UL>
        <li>Ask to sit at a hot desk for twenty minutes and run a real video call.</li>
        <li>Check phone booth availability during a busy hour, not just at the tour slot.</li>
        <li>Ask what happens when the internet goes down, not if it ever does.</li>
      </UL>
      <Callout label="Worth doing">
        Before you tour, pull up the questions on{" "}
        <Link to="/questions" className="text-iris underline underline-offset-2">
          our community Q&amp;A page
        </Link>
        . Coworkers have already asked most operators about wifi speed, cancellation policy and
        noise, and some of it is answered right there.
      </Callout>

      <H2>4. Read the contract before you fall in love with the amenities</H2>
      <P>
        Free coffee and a nice terrace do not matter if the contract has a steep exit fee or
        auto-renews quietly every year. Ask specifically about the notice period, whether the
        deposit is refundable, and what happens if you need to downsize your seat count midway.
      </P>
      <P>
        If you want a full list of exactly what to ask before signing anything, we have a
        separate, more detailed guide on that.
      </P>

      <H2>5. Ask about community and support, not just the desk</H2>
      <P>
        A coworking space is as much about the people running it as the furniture. Ask how
        service issues get escalated after hours, whether the community manager actually
        organises events, and how long it typically takes for a complaint to get resolved.
      </P>
      <P>
        You can get a decent read on this before you even visit. Check the space's page on{" "}
        <Link to="/spaces" className="text-iris underline underline-offset-2">
          our spaces directory
        </Link>{" "}
        for member reviews and ratings on community, support and more.
      </P>

      <H2>The checklist</H2>
      <UL>
        <li>Wrote down actual days-per-week and team size before shortlisting spaces.</li>
        <li>Ran the commute test from where the team actually lives.</li>
        <li>Visited or asked about the space during a busy hour, not just the tour slot.</li>
        <li>Tested wifi and noise levels directly, not just from what the sales rep says.</li>
        <li>Read the exit clause and deposit terms before signing anything.</li>
        <li>Checked member reviews for community and support ratings.</li>
      </UL>
      <P>
        None of this takes more than an extra day or two, and it is a lot cheaper than breaking a
        lease three months in.
      </P>
    </>
  );
}

export const meta = {
  slug: "how-to-choose-a-coworking-space",
  title: "How to choose a coworking space: a practical checklist",
  dek: "A step by step way to pick a space that actually fits how your team works, not just how it photographs.",
  category: "coworkers",
  readMins: 6,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
