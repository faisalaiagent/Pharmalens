import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "glow-input flex h-11 w-full rounded-xl px-4 py-2 text-sm transition-all duration-200 placeholder:text-[hsl(215_20%_40%)] disabled:cursor-not-allowed disabled:opacity-40 md:text-sm",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "hsl(210 40% 92%)",
        outline: "none"
      }}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";
