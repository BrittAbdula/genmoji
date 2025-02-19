"use client";

import { useGenerationStore } from "@/store/generation-store";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function GlobalGenerationIndicator() {
  const t = useTranslations('generator');
  const { isGenerating, progress, prompt, setGenerating } = useGenerationStore();

  if (!isGenerating) return null;

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 w-80"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {t('generatingButton')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setGenerating(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
            {prompt}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('generatingMessage')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 