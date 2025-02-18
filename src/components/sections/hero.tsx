"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('common');
  const hero = useTranslations('hero');

  return (
    <section className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {hero('title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {t('description')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
