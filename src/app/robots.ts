import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** /robots.txt — dashboard, galeri tamu, dan API internal tidak dirayapi. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/s/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
