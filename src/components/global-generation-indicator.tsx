"use client";

import { useGenerationStore } from "@/store/generation-store";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function GlobalGenerationIndicator() {
  const t = useTranslations('generator');
  const { isGenerating, progress, prompt, setGenerating } = useGenerationStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [shouldAutoCollapse, setShouldAutoCollapse] = useState(false);

  // 2秒后自动收缩
  useEffect(() => {
    if (isGenerating && isExpanded) {
      const timer = setTimeout(() => {
        setShouldAutoCollapse(true);
        setIsExpanded(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isExpanded]);

  // 重置状态当生成开始时
  useEffect(() => {
    if (isGenerating) {
      setIsExpanded(true);
      setShouldAutoCollapse(false);
    }
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-4 right-4 z-50"
        >
          {isExpanded ? (
            // 展开状态 - 完整面板
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 w-80"
              onClick={() => shouldAutoCollapse && setIsExpanded(false)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {t('generatingButton')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    setShouldAutoCollapse(true);
                    setIsExpanded(false);
                  }}
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
          ) : (
            // 收缩状态 - 圆形发光图标
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setIsExpanded(true)}
              className={cn(
                "relative w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-violet-500",
                "shadow-lg hover:shadow-xl transition-all duration-300",
                "flex items-center justify-center group",
                "before:absolute before:inset-0 before:rounded-full",
                "before:bg-gradient-to-r before:from-pink-500 before:to-violet-500",
                "before:animate-pulse before:opacity-75"
              )}
            >
              {/* 发光效果 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 animate-ping opacity-20" />
              
              {/* Logo 图标 */}
              <Image 
                src="/logo.png"
                alt="Genmoji Logo"
                width={24}
                height={24}
                className="relative z-10 group-hover:scale-110 transition-transform"
              />
              
              {/* 进度环 */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 