"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-black";

const variants = {
  default: "bg-[#D946EF] text-black hover:bg-[#f160ff]",
  secondary: "bg-[#111317] text-white border border-[#1f2128] hover:border-[#2b2d35]",
  ghost: "bg-transparent text-white hover:bg-white/5",
  outline: "border border-[#2b2d35] bg-transparent text-white hover:bg-white/5",
};

const sizes = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { asChild = false, className, variant = "default", size = "md", ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
