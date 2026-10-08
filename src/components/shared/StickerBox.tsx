import { cn } from "./cn";

type Shadow = "none" | "sm" | "md" | "lg";
const shadows: Record<Shadow, string> = {
  none: "",
  sm: "shadow-hard-sm",
  md: "shadow-hard",
  lg: "shadow-hard-lg",
};

/** Kotak bergaya stiker: garis hitam tebal + bayangan keras. */
export function StickerBox({
  as: Tag = "div",
  shadow = "md",
  className,
  children,
}: {
  as?: "div" | "article" | "li" | "section";
  shadow?: Shadow;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("rounded-3xl border-4 border-ink bg-white", shadows[shadow], className)}>{children}</Tag>
  );
}
