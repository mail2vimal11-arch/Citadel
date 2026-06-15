"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inbox" },
  { href: "/settings", label: "Settings" },
  { href: "/audit", label: "Audit log" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="topbar">
      <div className="brand">
        Sovereign Inbox
        <small>Privacy-first email assistant — concept prototype</small>
      </div>
      <nav>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
