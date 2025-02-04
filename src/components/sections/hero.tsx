"use client";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AuroraText } from "@/components/ui/aurora-text";
import { easeInOutCubic } from "@/lib/animation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useState, useEffect, useRef } from "react";
import EmojiContainer from "@/components/emoji-container";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ImageIcon, X } from 'lucide-react';

export function Hero() {
  return (
    <Section id="hero" className="w-full overflow-hidden bg-background">
      <div className="container mx-auto px-6 text-center ">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-primary mb-6">
          Welcome to Genmoji Online
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Your ultimate genmoji generator for creating personalized genmojis.
        </p>
      </div>
    </Section>
  );
}
