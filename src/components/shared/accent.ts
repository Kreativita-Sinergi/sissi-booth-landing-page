import type { Accent } from "@/constants/content";

/** Kelas latar per aksen (string utuh agar terdeteksi Tailwind). */
export const accentBg: Record<Accent, string> = {
  pink: "bg-booth-pink",
  blue: "bg-booth-blue",
  green: "bg-booth-green",
  orange: "bg-booth-orange",
  lilac: "bg-booth-lilac",
  yellow: "bg-booth-yellow",
  white: "bg-white",
};

/** Warna teks yang kontras di atas aksen. */
export const accentText: Record<Accent, string> = {
  pink: "text-ink",
  blue: "text-white",
  green: "text-ink",
  orange: "text-ink",
  lilac: "text-ink",
  yellow: "text-ink",
  white: "text-ink",
};
