"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AuroraTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  as?: React.ElementType
}

export const AuroraText = React.forwardRef<HTMLSpanElement, AuroraTextProps>(
  ({ className, children, as: Component = "span", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "animate-aurora bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-[length:200%_auto] bg-clip-text text-transparent",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

AuroraText.displayName = "AuroraText" 