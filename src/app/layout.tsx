import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
