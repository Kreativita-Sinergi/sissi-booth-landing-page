import { ArrowRight } from "lucide-react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "success" | "soft";
const variants: Record<Variant, string> = {
  primary: "bg-booth-blue text-white",
  secondary: "bg-white text-ink",
  success: "bg-booth-green text-ink",
  soft: "bg-booth-yellow text-ink",
};
const sizes = {
  md: "h-14 px-6 text-base rounded-2xl border-[3px] shadow-hard-sm",
  lg: "h-16 md:h-[72px] px-8 text-lg md:text-xl rounded-[18px] border-4 shadow-hard",
};

/**
 * Tautan berbentuk tombol stiker: naik sedikit saat disorot, "turun" menutup
 * bayangan saat ditekan.
 */
export function Button({
  href,
  variant = "primary",
  size = "md",
  arrow = false,
  external = false,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: keyof typeof sizes;
  arrow?: boolean;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "inline-flex items-center justify-center gap-2 border-ink font-label uppercase transition-all duration-100",
        "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        "focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-booth-blue",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
      {arrow && <ArrowRight aria-hidden className="size-5" strokeWidth={3} />}
    </a>
  );
}
