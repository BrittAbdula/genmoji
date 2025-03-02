"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const locale = useLocale();
  
  return (
    <nav className="py-4 container mx-auto px-4">
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li>
          <Link 
            href={`/${locale}`}
            className="flex items-center hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4 mr-1" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            {item.isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link 
                href={`/${locale}${item.path}`}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function generateBreadcrumb(path: string, currentLabel: string): BreadcrumbItem[] {
  // Split path into segments
  const segments = path.split('/').filter(Boolean);
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Build breadcrumb items based on path segments
  let currentPath = '';
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    // Skip locale segment
    if (i === 0 && (segment === 'en' || segment === 'zh' || segment === 'ja' || segment === 'fr')) {
      continue;
    }
    
    currentPath += `/${segment}`;
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbItems.push({
      label,
      path: currentPath,
    });
  }
  
  // Add current page as the last item
  breadcrumbItems.push({
    label: currentLabel,
    path: path,
    isLast: true,
  });
  
  return breadcrumbItems;
} 