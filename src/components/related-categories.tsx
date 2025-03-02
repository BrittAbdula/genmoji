"use client";

import { RelatedCategoriesProps, Category } from "@/types/emoji";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";

export function RelatedCategories({ group, categories, currentCategory }: RelatedCategoriesProps) {
  const locale = useLocale();
  // 容器动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // 子元素动画变体
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="bg-gradient-to-b from-muted/5 to-muted/20 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Explore Related Categories</h2>
          <div className="w-12 h-1 bg-primary/50 mx-auto rounded-full" />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category: Category) => (
            <motion.a
              key={category.name}
              href={`/${locale}/${group}/${category.slug}/`}
              className="block p-4 bg-background/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all text-center border border-muted/20"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                borderColor: "rgba(99, 102, 241, 0.3)"
              }}
            >
              <h3 className="font-medium capitalize">{category.translated_name}</h3>
              {category.count && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.count} emojis
                </p>
              )}
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
