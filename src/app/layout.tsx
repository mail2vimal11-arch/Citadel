import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter — the crisp UI typeface Superhuman/Linear-class apps use. next/font
// self-hosts it at build time (no runtime Google call); the system stack stays
// as the fallback in globals.css.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
