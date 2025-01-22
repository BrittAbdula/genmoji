"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  borderSize?: number;
  borderRadius?: number;
  neonColors?: {
    firstColor: string;
    secondColor: string;
  };
}

export function NeonCard({
  children,
  className,
  borderSize = 5,
  borderRadius = 20,
  neonColors = {
    firstColor: "rgb(var(--primary))",
    secondColor: "rgb(var(--secondary))",
  },
  ...props
}: NeonCardProps) {
  return (
    <div
      className={cn("relative group", className)}
      style={{
        borderRadius: borderRadius,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 blur-xl transition duration-500 group-hover:opacity-100 opacity-75"
        style={{
          background: `linear-gradient(45deg, ${neonColors.firstColor}, ${neonColors.secondColor})`,
          borderRadius: borderRadius - borderSize,
        }}
      />
      <div
        className="relative bg-background"
        style={{
          borderRadius: borderRadius - borderSize,
        }}
      >
        {children}
      </div>
    </div>
  );
} 