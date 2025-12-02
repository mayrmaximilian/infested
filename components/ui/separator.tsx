"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-px w-full bg-gradient-to-r from-white/0 via-white/10 to-white/0", className)}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
export type { SeparatorProps };
