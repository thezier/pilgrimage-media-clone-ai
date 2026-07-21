import type { Metadata } from "next";
import { Roboto_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// The live site serves both families from Squarespace's font CDN; they are
// stock Google families, so we self-host them through next/font instead.
// Only the weights the site actually uses are requested.
const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pilgrimage Media",
  description:
    "Media for those on a journey to make themselves and others better.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoCondensed.variable} ${plexMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
