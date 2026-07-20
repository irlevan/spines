"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/library", label: "Library" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-4xl items-center gap-8 px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-foreground"
        >
          epiloggd
        </Link>
        <div className="flex gap-1 text-sm">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-full bg-surface-2 px-3 py-1.5 font-medium text-foreground"
                    : "rounded-full px-3 py-1.5 text-muted transition-colors hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
