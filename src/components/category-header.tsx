"use client";

import { CategoryHeaderProps } from "@/types/emoji";
import { motion } from "framer-motion";

export function CategoryHeader({ category, totalCount, description }: CategoryHeaderProps) {
  const formattedCategory = category.replace(/_/g, ' ');
  
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20" />
      
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </motion.div>
      
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* 分类名称 */}
          <motion.h1 
            className="text-4xl font-bold mb-6 capitalize"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {formattedCategory} Genmojis
          </motion.h1>
          
          {/* 装饰线 */}
          <motion.div 
            className="w-16 h-1 bg-primary/50 mx-auto mb-6 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* 统计信息 */}
          {totalCount !== undefined && (
            <motion.p 
              className="text-lg text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="font-semibold text-primary">{totalCount.toLocaleString()}</span> genmojis in this category
            </motion.p>
          )}
          
          {/* 分类描述 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {description && (
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
            
            {!description && (
              <p className="text-muted-foreground leading-relaxed">
                Browse our collection of {formattedCategory.toLowerCase()} genmojis. Find the perfect genmoji for your messages and social media.
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 