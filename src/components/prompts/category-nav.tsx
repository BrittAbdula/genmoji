'use client';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { CATEGORY_LABELS } from '@/lib/categories';

export function CategoryNav({ activeCategory = 'all' }: { activeCategory?: string }) {
  // Map internal category IDs to URL slugs if needed, or use as is
  // For simplicity, we'll assume the URL slug matches the key, except 'smileys_emotion' might be cleaner as 'smileys'
  // But given existing data uses these keys, we'll keep them consistent for now or map them.
  // Let's stick to the keys for direct API mapping for now.

  return (
    <nav className="w-full overflow-x-auto pb-4" aria-label="Prompt Categories">
      <ul className="flex justify-start md:justify-center min-w-full md:min-w-0 gap-2 px-4">
        {Object.entries(CATEGORY_LABELS).map(([key, info]) => {
          // 'all' links to /prompts, others to /prompts/[category]
          const href = key === 'all' ? '/prompts' : `/prompts/${key}`;
          const isActive = activeCategory === key;

          return (
            <li key={key} className="flex-shrink-0">
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{info.emoji}</span>
                {info.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
