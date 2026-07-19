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
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight text-accent">
          epiloggd
        </Link>
        <div className="flex gap-4 text-sm">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "font-medium text-foreground"
                    : "text-muted hover:text-foreground"
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
