import { Link } from "@tanstack/react-router";
import { WhyThisMatters, Step, Tip, Closing, Source, RelatedLink } from "./ui";
import type { GuideModule } from "./types";

function Body() {
  return (
    <>
      <WhyThisMatters>
        A lot of founders assume a virtual office plan means instant GST registration. It does
        not. It gives you an address and paperwork to apply with, the registration itself still
        goes through the normal government process.
      </WhyThisMatters>

      <Step n={1} title="Understand what a virtual office actually gives you">
        <p>
          A virtual office plan gets you a registered business address, a No Objection
          Certificate (NOC) from the space owner, and sometimes mail handling. It does not get
          you a desk there by default, and it does not get you a GST number by itself.
        </p>
      </Step>

      <Step n={2} title="Confirm the operator's documentation is actually GST-ready">
        <p>
          Not every "virtual office" plan is set up for GST registration. Ask specifically
          whether they provide a rent or leave-and-license agreement, an NOC addressed for GST
          purposes, and a recent utility bill or property tax receipt for that address. Some
          operators only do mail forwarding, which will not work for registration.
        </p>
      </Step>

      <Step n={3} title="Gather the standard document set">
        <p>
          Typically you will need the leave and license agreement or rent agreement, the NOC,
          a utility bill or property tax receipt as address proof, your PAN and identity
          documents, and business constitution proof (partnership deed, incorporation
          certificate, and so on depending on your entity type).
        </p>
      </Step>

      <Step n={4} title="Set a realistic timeline">
        <p>
          Processing time varies by state and by how busy the jurisdiction's office is that
          month. Do not book client meetings or vendor contracts around a specific registration
          date, build in buffer.
        </p>
        <Tip>Ask the virtual office operator how many other GST registrations they have supported at that exact address. A high number is usually a good sign the paperwork is well practiced.</Tip>
      </Step>

      <Step n={5} title="Ask about physical verification support">
        <p>
          GST officers sometimes conduct a physical verification of the registered address.
          Ask your operator upfront whether they support this, for example by having someone
          available to confirm the business's presence if an officer visits.
        </p>
      </Step>

      <Step n={6} title="Loop in a CA for the filing itself">
        <p>
          This guide covers what to prepare, not how to file. GST rules, forms, and timelines
          change and vary by state, so treat the actual registration as a job for a chartered
          accountant or GST practitioner rather than a first-time DIY filing.
        </p>
        <Source>
          <a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">gst.gov.in</a>, the official GST portal, for current forms and requirements.
        </Source>
      </Step>

      <Closing>
        The paperwork prep is the part you can control. Once your documents are in order, a
        good CA can usually move the actual filing along faster than you would on your own.
      </Closing>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <RelatedLink to="/spaces">Browse spaces offering virtual offices</RelatedLink>
        <RelatedLink to="/questions">Ask the community about specific operators</RelatedLink>
      </div>
    </>
  );
}

export const meta = {
  slug: "gst-registration-virtual-offices-guide",
  title: "GST registration and virtual offices",
  dek: "What founders actually need to know before signing up for a virtual office plan.",
  category: "coworkers",
  readMins: 5,
} as const;

const guide: GuideModule = { ...meta, Body };
export default guide;
