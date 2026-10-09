import type { MetadataRoute } from "next";
import { guides } from "@/constants/guides";
import { contentUpdated, siteUrl } from "@/lib/seo";

/** /sitemap.xml — halaman publik saja (dashboard & galeri tidak dicantumkan). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: contentUpdated, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/panduan`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.8 },
    ...guides.map((g) => ({
      url: `${siteUrl}/panduan/${g.slug}`,
      lastModified: contentUpdated,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
