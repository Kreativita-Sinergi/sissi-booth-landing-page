import { cn } from "./cn";

type Shadow = "none" | "sm" | "md" | "lg";
const shadows: Record<Shadow, string> = {
  none: "",
  sm: "shadow-hard-sm",
  md: "shadow-hard",
  lg: "shadow-hard-lg",
};

/**
 * Kotak bergaya stiker: garis hitam tebal + bayangan keras.
 * Warna latar lewat `fill` (bukan className) agar tidak bentrok dengan `bg-white` bawaan.
 */
export function StickerBox({
  as: Tag = "div",
  shadow = "md",
  fill = "bg-white",
  className,
  children,
}: {
  as?: "div" | "article" | "li" | "section";
  shadow?: Shadow;
  /** Kelas latar, mis. `bg-booth-pink`. */
  fill?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("rounded-3xl border-4 border-ink", fill, shadows[shadow], className)}>{children}</Tag>
  );
}
