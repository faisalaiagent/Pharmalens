import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#22d3ee] to-[#a78bfa] text-[#0b0f1a] shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02]",
        secondary:
          "bg-[rgba(167,139,250,0.12)] text-[#a78bfa] border border-[rgba(167,139,250,0.25)] hover:bg-[rgba(167,139,250,0.2)]",
        outline:
          "border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] text-[hsl(210_40%_75%)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[hsl(210_40%_92%)] hover:border-[rgba(255,255,255,0.2)]",
        ghost:
          "text-[hsl(215_20%_60%)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[hsl(210_40%_85%)]",
        destructive:
          "bg-[rgba(248,113,113,0.12)] text-[#f87171] border border-[rgba(248,113,113,0.25)] hover:bg-[rgba(248,113,113,0.2)]"
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
