"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/library", label: "Library" },
  { href: "/export", label: "Import / Export" },
];

export default function NavBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-line px-5 py-4 md:hidden">
        <Link href="/" className="font-display text-2xl italic text-foreground">
          epiloggd
        </Link>
        <nav className="flex gap-1 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? "rounded-full bg-foreground px-3 py-1.5 font-medium text-background"
                  : "rounded-full px-3 py-1.5 text-muted"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col justify-between border-r border-line px-6 py-8 md:flex">
        <div>
          <Link href="/" className="font-display text-3xl italic text-foreground">
            epiloggd
          </Link>
          <nav className="mt-10 flex flex-col gap-1 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1.5 pl-4 transition-colors ${
                  isActive(link.href)
                    ? "font-medium text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {isActive(link.href) ? (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-ribbon" />
                ) : null}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
