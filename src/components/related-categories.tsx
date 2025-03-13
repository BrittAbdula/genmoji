

import { RelatedCategoriesProps, Category } from "@/types/emoji";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
              className={cn(
                "block p-4 bg-background/80 backdrop-blur-sm rounded-xl transition-all text-center",
                "border border-muted/20 hover:border-primary/30",
                "shadow-sm hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                currentCategory === category.slug ? "bg-primary/10 border-primary/30" : ""
              )}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              {group === "color" && (
                <div className="flex justify-center mb-2">
                  <div 
                    className="w-5 h-5 rounded-full border border-muted/30"
                    style={{ 
                      backgroundColor: getColorHex(category.name)
                    }}
                  />
                </div>
              )}
              <h3 className="font-medium capitalize">{category.translated_name}</h3>
              {category.count && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.count} genmojis
                </p>
              )}
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// 辅助函数：将颜色名称转换为十六进制值
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    gold: '#FFD700',
    silver: '#C0C0C0',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    lime: '#00FF00',
    teal: '#008080',
    indigo: '#4B0082',
    violet: '#EE82EE',
    maroon: '#800000',
    navy: '#000080',
    olive: '#808000',
  };
  
  return colorMap[colorName.toLowerCase()] || '#CCCCCC';
}
