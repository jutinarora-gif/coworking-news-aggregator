"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/#news", label: "Dispatches" },
  { href: "/#cities", label: "City Files" },
  { href: "/coworking", label: "Coworking Industry" },
];

const today = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-ink/15">
      <div className="hidden md:flex items-center justify-between px-8 py-3 border-b border-ink/10">
        <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-graphite">
          {today}
        </span>
        <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-graphite">
          A dispatch for the location-independent
        </span>
        <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-graphite">
          UTC · Anywhere
        </span>
      </div>

      <div className="flex items-center justify-between px-6 sm:px-8 py-6">
        <Link href="/" className="flex items-baseline gap-3 group">
          <span className="font-serif text-3xl sm:text-4xl leading-none tracking-tight text-ink group-hover:text-terracotta transition-colors duration-300">
            Coworking Dispatch
          </span>
          <span className="hidden sm:inline font-sans text-[10px] uppercase tracking-[0.28em] text-graphite">
            / news for the borderless life
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="editorial-link font-sans text-[11px] uppercase tracking-[0.22em] text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-ink"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink/15 px-6 py-6 bg-paper">
          <ul className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-sans text-xs uppercase tracking-[0.22em] text-ink hover:text-terracotta"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
