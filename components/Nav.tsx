"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

const links = [
  { label: "01 / Work", href: "#work", id: "work" },
  { label: "02 / Projects", href: "#projects", id: "projects" },
  { label: "03 / About", href: "#about", id: "about" },
];

export function Nav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const ids = ["top", "work", "projects", "about", "contact"];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive((e.target as HTMLElement).id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-4 md:px-10 lg:px-16">
        <a href="#top" aria-label="Home">
          <Wordmark />
        </a>
        <div className="flex items-center gap-6 md:gap-10">
          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => {
              const on = active === l.id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-2 font-mono text-[13px] tracking-[0.08em] transition-colors ${
                    on ? "text-cream" : "text-muted hover:text-cream"
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full transition-colors ${
                      on ? "bg-green" : "bg-transparent"
                    }`}
                  />
                  {l.label}
                </a>
              );
            })}
          </div>
          <a
            href="#contact"
            className="flex items-center gap-2 rounded-full bg-green px-4 py-2.5 font-mono text-[13px] font-bold tracking-[0.04em] text-green-deep transition-opacity hover:opacity-90"
          >
            GET IN TOUCH
            <span aria-hidden>↗</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
