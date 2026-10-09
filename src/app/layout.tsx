import type { Metadata } from "next";
import { Archivo_Black, Bagel_Fat_One, Space_Grotesk, Space_Mono } from "next/font/google";
import { site } from "@/constants/content";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const bagel = Bagel_Fat_One({ variable: "--font-bagel", weight: "400", subsets: ["latin"] });
const archivo = Archivo_Black({ variable: "--font-archivo", weight: "400", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", weight: "700", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  keywords: ["photobooth", "photobox", "aplikasi photobooth", "Sissi Booth", "QRIS"],
  authors: [{ name: site.company }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: site.title,
    description: site.description,
    // Gambar pratinjau dibuat otomatis oleh src/app/opengraph-image.tsx.
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${bagel.variable} ${archivo.variable} ${grotesk.variable} ${spaceMono.variable}`}>
      <body className="overflow-x-clip antialiased">{children}</body>
    </html>
  );
}
