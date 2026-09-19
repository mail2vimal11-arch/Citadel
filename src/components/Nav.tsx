"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/inbox", label: "Inbox" },
  { href: "/settings", label: "Settings" },
  { href: "/audit", label: "Audit log" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo" aria-hidden>C</span>
        <span className="brand-text">
          <b>Citadel</b>
          <small>Your sovereign inbox</small>
        </span>
      </div>
      <nav className="nav-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
