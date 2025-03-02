"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getEmojiGroups } from "@/lib/api";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Category } from "@/types/emoji";
import { LayoutGrid, Palette, Shapes } from "lucide-react";
import { useTranslations } from 'next-intl';

// 用于样式列表项的自定义组件
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span>{title}</span>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function CategoryNavigation() {
  const locale = useLocale();
  const nav = useTranslations('common.navigation');
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Category[]>([]);
  const [models, setModels] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const groups = await getEmojiGroups(locale);
        
        // 设置分类数据
        const formattedCategories = groups.categories
          .map(category => ({
            id: category.name,
            name: category.name,
            translated_name: category.translated_name,
            slug: category.name,
            count: category.count || 0
          }))
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, 6); // 只显示前6个分类
        
        // 设置颜色数据
        const formattedColors = groups.colors
          .map(color => ({
            id: color.name,
            name: color.name,
            translated_name: color.translated_name,
            slug: color.name,
            count: color.count || 0
          }))
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, 6); // 只显示前6个颜色
        
        // 设置模型数据
        const formattedModels = groups.models
          .map(model => ({
            id: model.name,
            name: model.name,
            translated_name: model.translated_name,
            slug: model.name,
            count: model.count || 0
          }))
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, 6); // 只显示前6个模型
        
        setCategories(formattedCategories);
        setColors(formattedColors);
        setModels(formattedModels);
      } catch (error) {
        console.error('Failed to fetch emoji groups:', error);
      }
    }
    
    fetchGroups();
  }, [locale]);

  // 首字母大写函数
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* 分类菜单 */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>{nav('categories')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    href={`/category`}
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/10 to-primary/30 p-6 no-underline outline-none focus:shadow-md"
                  >
                    <Shapes className="h-6 w-6 mb-2" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      {nav('allCategories')}
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      {nav('categoriesDescription')}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              {categories.map((category) => (
                <ListItem
                  key={category.slug}
                  title={capitalize(category.translated_name.replace(/_/g, ' '))}
                  href={`/${locale}/category/${category.slug}/`}
                >
                  {category.count 
                    ? nav('emojiCount', { count: category.count })
                    : nav('exploreCategory')}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* 颜色菜单 */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>{nav('colors')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    href={`/color`}
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/10 to-primary/30 p-6 no-underline outline-none focus:shadow-md"
                  >
                    <Palette className="h-6 w-6 mb-2" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      {nav('allColors')}
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      {nav('colorsDescription')}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              {colors.map((color) => (
                <ListItem
                  key={color.slug}
                  title={capitalize(color.translated_name)}
                  href={`/${locale}/color/${color.slug}/`}
                  icon={
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: getColorHex(color.name)
                      }}
                    />
                  }
                >
                  {color.count 
                    ? nav('emojiCount', { count: color.count })
                    : nav('exploreColor')}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* 模型菜单 */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>{nav('models')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    href={`/model`}
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/10 to-primary/30 p-6 no-underline outline-none focus:shadow-md"
                  >
                    <LayoutGrid className="h-6 w-6 mb-2" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      {nav('allModels')}
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      {nav('modelsDescription')}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              {models.map((model) => (
                <ListItem
                  key={model.slug}
                  title={capitalize(model.translated_name)}
                  href={`/${locale}/model/${model.slug}/`}
                >
                  {model.count 
                    ? nav('emojiCount', { count: model.count })
                    : nav('exploreModel')}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
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
  
  return colorMap[colorName.toLowerCase()] || '#808080'; // 默认为灰色
} 