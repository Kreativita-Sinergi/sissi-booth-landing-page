/**
 * Bahan SEO bersama: alamat situs, tanggal konten, dan data terstruktur (JSON-LD schema.org).
 * Semua statis (tanpa `new Date()`) karena halaman diprerender.
 */
import { faq, site } from "@/constants/content";
import { type Guide, guideUi } from "@/constants/guides";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://booth.sissi.id").replace(/\/+$/, "");

/** Tanggal terakhir isi diperbarui (sitemap). Ubah saat teks/panduan berubah. */
export const contentUpdated = "2026-10-09";

const abs = (path: string) => `${siteUrl}${path}`;

/** "1:23" → "PT1M23S" (durasi ISO 8601). */
const isoDuration = (d: string) => {
  const [m, s] = d.split(":").map(Number);
  return `PT${m}M${s}S`;
};

const organization = {
  "@type": "Organization",
  "@id": abs("/#organisasi"),
  name: site.company,
  url: siteUrl,
  logo: abs("/apple-icon"),
  email: site.email,
  contactPoint: { "@type": "ContactPoint", telephone: "+62-851-6146-2806", contactType: "customer service", availableLanguage: "Indonesian" },
};

/** Beranda: organisasi, situs, aplikasi, dan FAQ. */
export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      { "@type": "WebSite", "@id": abs("/#situs"), name: "Sissi Booth", url: siteUrl, inLanguage: "id-ID", publisher: { "@id": organization["@id"] } },
      {
        "@type": "SoftwareApplication",
        name: "Sissi Booth",
        applicationCategory: "BusinessApplication",
        description: site.description,
        url: siteUrl,
        inLanguage: "id-ID",
        publisher: { "@id": organization["@id"] },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };
}

/** Halaman satu panduan: langkah (HowTo), video, jejak halaman, dan tanya jawab. */
export function guideJsonLd(guide: Guide) {
  const url = abs(`/panduan/${guide.slug}`);
  const cover = abs(`/panduan/${guide.slug}/sampul.jpg`);
  const video = {
    "@type": "VideoObject",
    name: `${guideUi.video.prefix}${guide.no}: ${guide.title}`,
    description: guide.summary,
    thumbnailUrl: cover,
    uploadDate: guide.video.uploaded,
    duration: isoDuration(guide.video.duration),
    embedUrl: `https://www.youtube.com/embed/${guide.video.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${guide.video.id}`,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        "@id": `${url}#panduan`,
        name: guide.title,
        description: guide.overview,
        image: cover,
        inLanguage: "id-ID",
        supply: guide.prerequisites.map((p) => ({ "@type": "HowToSupply", name: p })),
        step: guide.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title,
          text: s.body,
          url: `${url}#${s.id}`,
          image: abs(s.shots[0].src),
        })),
        video,
        publisher: { "@id": organization["@id"] },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: guideUi.breadcrumbHome, item: siteUrl },
          { "@type": "ListItem", position: 2, name: guideUi.breadcrumbGuide, item: abs("/panduan") },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
      ...(guide.faqs.length > 0
        ? [{ "@type": "FAQPage", mainEntity: guide.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }]
        : []),
    ],
  };
}

/** `<script type="application/ld+json">`; `<` di-escape agar teks tidak bisa menutup tag script. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
