import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

// Inter — the crisp UI typeface Superhuman/Linear-class apps use for body + app
// chrome. next/font self-hosts it at build time (no runtime Google call); the
// system stack stays as the fallback in globals.css.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Fraunces — an editorial high-contrast serif (optical sizing) for the brand
// wordmark and marketing display type. It gives the landing page gravitas and a
// considered, premium feel rather than the default-sans "template" look. Used
// only for headings, so body copy stays crisp in Inter.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Citadel — your sovereign inbox",
  description:
    "Citadel — privacy-first email that runs AI on infrastructure you control, and forgets on a schedule you can prove.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
