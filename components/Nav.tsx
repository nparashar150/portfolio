import { Wordmark } from "./Wordmark";

const links = [
  { label: "01 — Work", href: "#work" },
  { label: "02 — Projects", href: "#projects" },
  { label: "03 — About", href: "#about" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-4 md:px-10 lg:px-16">
        <a href="#top" aria-label="Home">
          <Wordmark />
        </a>
        <div className="flex items-center gap-6 md:gap-10">
          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
