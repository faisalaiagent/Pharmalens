import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "cyan" | "violet" | "amber" | "green" | "red";

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "hsl(210 40% 80%)"
  },
  cyan: {
    background: "rgba(34,211,238,0.1)",
    border: "1px solid rgba(34,211,238,0.25)",
    color: "#22d3ee"
  },
  violet: {
    background: "rgba(167,139,250,0.1)",
    border: "1px solid rgba(167,139,250,0.25)",
    color: "#a78bfa"
  },
  amber: {
    background: "rgba(251,191,36,0.1)",
    border: "1px solid rgba(251,191,36,0.25)",
    color: "#fbbf24"
  },
  green: {
    background: "rgba(52,211,153,0.1)",
    border: "1px solid rgba(52,211,153,0.25)",
    color: "#34d399"
  },
  red: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.25)",
    color: "#f87171"
  }
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all",
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}
