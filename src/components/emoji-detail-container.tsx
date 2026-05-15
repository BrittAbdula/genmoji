"use client";

import { Emoji } from "@/types/emoji";
import EmojiContainer from "@/components/emoji-container";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { performAction, toggleLike, getEmojisByBaseSlug } from "@/lib/api";
import { shareEmojiNative } from "@/lib/sharing";
import { Button } from "./ui/button";
import {
  DownloadIcon,
  MoreHorizontalIcon,
  HeartIcon,
  CheckIcon,
  CopyIcon,
  ImageIcon,
  Share2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useState, useEffect, useRef, memo, useMemo, forwardRef } from "react";
import dynamic from 'next/dynamic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';
import { UnifiedGenmojiGenerator } from './unified-genmoji-generator';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";

const ShareSheet = dynamic(
  () => import('./share-sheet').then((m) => ({ default: m.ShareSheet })),
  { ssr: false }
);

interface EmojiDetailContainerProps {
  emoji: Emoji;
}

// 主图片展示组件
const MainImage = memo(({
  emoji,
  onSwipe,
  onLongPress,
  className
}: {
  emoji: Emoji;
  onSwipe: (direction: 'left' | 'right') => void;
  onLongPress?: (e: React.MouseEvent | React.TouchEvent) => void;
  className?: string;
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 只在客户端检测移动设备，避免 SSR 不匹配
  useEffect(() => {
    const checkMobile = () => {
      return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    setIsMobile(checkMobile());
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) {
      const timer = setTimeout(() => {
        onLongPress?.(e);
      }, 800); // 800ms 长按
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isMobile) {
      e.preventDefault();
      onLongPress?.(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-muted/5 to-muted/10 backdrop-blur-sm relative", className)}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (swipe < -100) {
          onSwipe('right');
        } else if (swipe > 100) {
          onSwipe('left');
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={emoji.slug}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full p-8"
        >
          <div className={cn(
            "w-full h-full flex items-center justify-center rounded-lg",
            // 浅色模式：极浅深色底 + 内描边
            "bg-black/5",
            "[box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.06)]",
            // 深色模式：极浅浅色底 + 内描边
            "dark:bg-white/5",
            "dark:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          )}>
            <Image
              src={emoji.image_url}
              alt={`genmoji: ${emoji.prompt}`}
              width={512}
              height={512}
              className={cn(
                "w-full h-full object-contain",
                // 浅色模式：微弱深色投影；深色：微弱浅色投影
                "drop-shadow-[0_0_0.75px_rgba(0,0,0,0.6)]",
                "dark:drop-shadow-[0_0_0.75px_rgba(255,255,255,0.7)]"
              )}
              draggable={!isMobile} // 移动端不禁用拖拽，支持原生保存行为
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onContextMenu={handleContextMenu}
              style={{
                // 移动端允许用户选择和长按，桌面端禁用
                userSelect: isMobile ? 'auto' : 'none',
                WebkitUserSelect: isMobile ? 'auto' : 'none',
                pointerEvents: 'auto'
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 参考图片角标 */}
      {emoji.has_reference_image && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute top-3 right-3 z-10"
        >
          <div className="relative group">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/90 hover:bg-primary rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {/* Generated with reference image */}
              📷 Reference
              <div className="absolute bottom-full right-2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-black/80"></div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

// 预览图片组件
const PreviewImage = memo(({
  emoji,
  direction,
  onClick
}: {
  emoji: Emoji;
  direction: 'left' | 'right';
  onClick: () => void;
}) => {
  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 w-1/4 flex items-center cursor-default opacity-30",
        direction === 'left' ? 'left-0 justify-start' : 'right-0 justify-end'
      )}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
      >
        <div className={cn(
          "w-full h-full flex items-center justify-center rounded-md",
          "bg-black/5",
          "[box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.06)]",
          "dark:bg-white/5",
          "dark:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        )}>
          <Image
            src={emoji.image_url}
            alt={`genmoji: ${direction} variation`}
            width={128}
            height={128}
            className={cn(
              "w-full h-full object-contain",
              "drop-shadow-[0_0_0.75px_rgba(0,0,0,0.6)]",
              "dark:drop-shadow-[0_0_0.75px_rgba(255,255,255,0.7)]"
            )}
          />
        </div>
      </motion.div>
    </div>
  );
});

// Simplified thumbnail component
const VariationThumbnail = memo(forwardRef<HTMLButtonElement, {
  variation: Emoji;
  isSelected: boolean;
  onClick: () => void;
}>(({ variation, isSelected, onClick }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        "relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden",
        // 强化选中态边框，方角、无背景，提升对比度
        isSelected
          ? "ring-2 ring-primary/60 outline outline-1 outline-white/10"
          : "ring-1 ring-transparent hover:ring-border/60"
      )}
      aria-pressed={isSelected}
      title={variation.prompt}
    >
      <div className={cn(
        "absolute inset-0 m-1 rounded-md flex items-center justify-center",
        "bg-black/5",
        "[box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.06)]",
        "dark:bg-white/5",
        "dark:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]"
      )}>
        <Image
          src={variation.image_url}
          alt={`genmoji: ${variation.prompt}`}
          width={96}
          height={96}
          className={cn(
            "w-full h-full object-contain p-2",
            "drop-shadow-[0_0_0.75px_rgba(0,0,0,0.6)]",
            "dark:drop-shadow-[0_0_0.75px_rgba(255,255,255,0.7)]"
          )}
          loading="lazy"
          draggable={false}
        />
      </div>
    </button>
  );
}));

VariationThumbnail.displayName = 'VariationThumbnail';

// Simplified variations list
const VariationsList = memo(({
  variations,
  currentIndex,
  onVariationSelect,
  isLoading
}: {
  variations: Emoji[];
  currentIndex: number;
  onVariationSelect: (index: number) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Gentler scrolling with a small delay to avoid jumpiness
  useEffect(() => {
    const timer = setTimeout(() => {
      const selectedThumbnail = thumbnailRefs.current[currentIndex];
      if (selectedThumbnail && scrollContainerRef.current) {
        selectedThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="w-full mb-4">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto px-2 mx-auto max-w-full md:max-w-xl"
      >
        <div className="flex gap-3 py-4 justify-center">
          {variations.map((variation, index) => (
            <VariationThumbnail
              key={variation.slug}
              ref={(el: HTMLButtonElement | null) => {
                thumbnailRefs.current[index] = el;
              }}
              variation={variation}
              isSelected={index === currentIndex}
              onClick={() => onVariationSelect(index)}
            />
          ))}
          {isLoading && (
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export function EmojiDetailContainer({ emoji: initialEmoji }: EmojiDetailContainerProps) {
  const t = useTranslations('emoji.detail');
  const tContainer = useTranslations('emoji.container');
  const locale = useLocale();
  const router = useRouter();
  const [currentEmoji, setCurrentEmoji] = useState(initialEmoji);
  const [allVariations, setAllVariations] = useState<Emoji[]>([]);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialEmoji.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showPromptCopied, setShowPromptCopied] = useState(false);
  const [showImageCopied, setShowImageCopied] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showLikeEffect, setShowLikeEffect] = useState(false);
  const likeTimeoutRef = useRef<NodeJS.Timeout>();
  const initialLikeState = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;
  const [isUsageExpanded, setIsUsageExpanded] = useState(false);
  const [showRemixGenerator, setShowRemixGenerator] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showShared, setShowShared] = useState(false);

  // 获取变体 - 只在初始化时调用一次
  const fetchVariations = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const newEmojis = await getEmojisByBaseSlug(initialEmoji.slug, locale, LIMIT, 0);
      const safeEmojis = newEmojis.filter((e) => e.image_url && e.image_url.trim() !== '');
      const safeInitial = initialEmoji.image_url && initialEmoji.image_url.trim() !== '' ? [initialEmoji] : [];

      // 确保当前emoji在列表中，并找到它的位置
      const currentEmojiIndex = safeEmojis.findIndex(e => e.slug === initialEmoji.slug);
      if (currentEmojiIndex === -1) {
        // 如果当前emoji不在返回列表中，将其添加到开头
        setAllVariations([...safeInitial, ...safeEmojis]);
        setDisplayIndex(0);
      } else {
        setAllVariations(safeEmojis);
        setDisplayIndex(currentEmojiIndex);
      }
    } catch (err) {
      console.error('Failed to fetch emoji variations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载 - 只执行一次
  useEffect(() => {
    fetchVariations();
  }, []);

  // 检查点赞状态
  const checkLikeStatus = (slug: string) => {
    const likedEmojis = JSON.parse(localStorage.getItem('likedEmojis') || '[]');
    const hasLiked = likedEmojis.includes(slug);
    setIsLiked(hasLiked);
    initialLikeState.current = hasLiked;
  };

  const refreshEmoji = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const url = new URL(API_ENDPOINTS.EMOJI_BY_SLUG(currentEmoji.slug), API_BASE_URL);
      url.searchParams.set('locale', locale);
      url.searchParams.set('no_cache', '1');
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to refresh emoji');
      }
      const data = await res.json();
      if (data?.success && data?.emoji) {
        setCurrentEmoji(data.emoji);
        setLikesCount(data.emoji.likes_count || 0);
        checkLikeStatus(data.emoji.slug);
        setAllVariations((prev) => {
          if (!prev || prev.length === 0) return prev;
          const exists = prev.some((e) => e.slug === data.emoji.slug);
          if (!exists) return [data.emoji, ...prev];
          return prev.map((e) => (e.slug === data.emoji.slug ? data.emoji : e));
        });
      }
    } catch (err) {
      console.error('Failed to refresh emoji:', err);
    } finally {
      setRefreshing(false);
      setRefreshAttempted(true);
    }
  };

  const hasImage = !!(currentEmoji.image_url && currentEmoji.image_url.trim() !== '');
  const isIncomplete = !hasImage || currentEmoji.status === 'pending' || currentEmoji.status === 'processing' || currentEmoji.status === 'failed';

  useEffect(() => {
    if (isIncomplete && !refreshAttempted) {
      refreshEmoji();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIncomplete, refreshAttempted, currentEmoji.slug, locale]);

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (displayIndex > 0) {
          handleVariationChange(displayIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (displayIndex < allVariations.length - 1) {
          handleVariationChange(displayIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayIndex, allVariations.length]);

  // 切换显示的变体
  const handleVariationChange = (index: number) => {
    if (index < 0 || index >= allVariations.length) return;

    setDisplayIndex(index);
    const selectedEmoji = allVariations[index];
    setCurrentEmoji(selectedEmoji);
    // 重置状态
    setIsLiked(false);
    setLikesCount(selectedEmoji.likes_count || 0);
    checkLikeStatus(selectedEmoji.slug);

    // 更新标题和信息栏数据
    document.title = t('meta.title', { prompt: selectedEmoji.prompt });
    const newUrl = new URL(window.location.href);
    newUrl.pathname = `${locale === 'en' ? '' : `/${locale}`}/emoji/${selectedEmoji.slug}`;
    window.history.replaceState({}, '', newUrl.toString());
  };

  // 记录浏览行为
  // useEffect(() => {
  //   const referrer = document.referrer;
  //   performAction(initialEmoji.slug, locale, 'view', {
  //     referrer,
  //   }).catch(error => {
  //     console.error('Failed to record view:', error);
  //   });
  // }, [initialEmoji.slug, locale]);

  // 检查用户是否已经点赞过
  useEffect(() => {
    checkLikeStatus(currentEmoji.slug);
    return () => {
      if (likeTimeoutRef.current) {
        clearTimeout(likeTimeoutRef.current);
      }
    };
  }, [currentEmoji.slug]);

  // 获取当前URL
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };

  // 复制链接
  const handleCopy = async () => {
    if (isCopied) return;
    setIsCopied(true);

    try {
      // 先执行复制操作
      await navigator.clipboard.writeText(getShareUrl());
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);

      // 异步提交行为数据
      performAction(currentEmoji.slug, locale, 'copy').catch(error => {
        console.error('Failed to record copy action:', error);
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // 复制提示词
  const handlePromptCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentEmoji.prompt);
      setShowPromptCopied(true);
      setTimeout(() => setShowPromptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  // 复制图片到剪贴板
  const handleCopyImage = async () => {
    if (isCopyingImage || showImageCopied) return;
    
    setIsCopyingImage(true);
    
    try {
      const response = await fetch(currentEmoji.image_url);
      const blob = await response.blob();

      // 检测是否支持剪贴板 API
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          
          setIsCopyingImage(false);
          setShowImageCopied(true);
          setTimeout(() => setShowImageCopied(false), 2000);

          // 异步提交行为数据
          performAction(currentEmoji.slug, locale, 'copy', { type: 'image' }).catch(error => {
            console.error('Failed to record image copy action:', error);
          });
          return;
        } catch (clipboardError) {
          console.log('Clipboard API failed, trying alternative method');
        }
      }

      // 如果剪贴板不支持，提示用户长按保存
      throw new Error('Clipboard not supported');
    } catch (err) {
      setIsCopyingImage(false);
      console.error('Failed to copy image:', err);
      // 对于不支持的情况，提示用户长按图片保存
      alert(t('alert.longPressToSave'));
    }
  };

    // 处理长按图片保存到相册
  const handleImageLongPress = async (e: React.MouseEvent | React.TouchEvent) => {
    // 对于移动端，依赖浏览器原生的长按保存行为
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 移动端：让浏览器处理原生的长按保存到相册行为
      // 不阻止默认行为，让系统菜单出现
      return;
    } else {
      // 桌面端：右键菜单触发下载
      e.preventDefault();
      try {
        const response = await fetch(currentEmoji.image_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentEmoji.slug}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // 记录保存行为
        performAction(currentEmoji.slug, locale, 'download').catch(error => {
          console.error('Failed to record longpress save action:', error);
        });
      } catch (error) {
        console.error('Failed to save image on long press:', error);
      }
    }
  };

  // 处理下载
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // 先执行下载操作
      const response = await fetch(currentEmoji.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentEmoji.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 异步提交行为数据
      performAction(currentEmoji.slug, locale, 'download').catch(error => {
        console.error('Failed to record download action:', error);
      });
    } catch (error) {
      console.error('Failed to download emoji:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // 处理分享：优先用 Web Share API L2 把图片当附件发，失败则打开 ShareSheet
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const result = await shareEmojiNative(
        currentEmoji,
        t('sharing.defaultText', { prompt: currentEmoji.prompt }),
        locale
      );
      if (result === 'shared') {
        setShowShared(true);
        setTimeout(() => setShowShared(false), 2000);
      } else if (result === 'unsupported' || result === 'error') {
        setIsShareSheetOpen(true);
      }
      // result === 'canceled' → 用户取消，什么都不做
    } finally {
      setIsSharing(false);
    }
  };

  // 更新本地存储的点赞状态
  const updateLocalLikeStatus = (liked: boolean) => {
    const likedEmojis = JSON.parse(localStorage.getItem('likedEmojis') || '[]');
    if (liked && !likedEmojis.includes(currentEmoji.slug)) {
      likedEmojis.push(currentEmoji.slug);
    } else if (!liked) {
      const index = likedEmojis.indexOf(currentEmoji.slug);
      if (index > -1) {
        likedEmojis.splice(index, 1);
      }
    }
    localStorage.setItem('likedEmojis', JSON.stringify(likedEmojis));
  };

  // 处理点赞动画
  const triggerLikeAnimation = () => {
    setShowLikeEffect(true);
    if (likeTimeoutRef.current) {
      clearTimeout(likeTimeoutRef.current);
    }
    likeTimeoutRef.current = setTimeout(() => {
      setShowLikeEffect(false);
    }, 1000);
  };

  // 处理点赞
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await toggleLike(currentEmoji.slug, locale);

      if (response.success && response.data?.liked !== undefined) {
        // 使用服务器返回的状态更新UI
        setIsLiked(response.data.liked);
        updateLocalLikeStatus(response.data.liked);
        initialLikeState.current = response.data.liked;

        // 触发动画效果
        if (response.data.liked) {
          triggerLikeAnimation();
        }
      }
    } catch (error: any) {
      console.error('Failed to toggle like:', error);

      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error === 'Emoji not found') {
          // 处理表情不存在的情况
          console.error('Emoji not found');
        }
      } catch {
        // JSON 解析失败，说明不是预期的错误格式
      }
    } finally {
      setIsLiking(false);
    }
  };

  // 处理滑动
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && displayIndex < allVariations.length - 1) {
      handleVariationChange(displayIndex + 1);
    } else if (direction === 'left' && displayIndex > 0) {
      handleVariationChange(displayIndex - 1);
    }
  };

  // 缓存主要展示区域
  const mainImageSection = useMemo(() => (
    <div className="relative w-full aspect-square mb-2 overflow-hidden">
      {allVariations.length > 1 && displayIndex > 0 && (
        <PreviewImage
          emoji={allVariations[displayIndex - 1]}
          direction="left"
          onClick={() => handleVariationChange(displayIndex - 1)}
        />
      )}

      <MainImage
        emoji={currentEmoji}
        onSwipe={handleSwipe}
        onLongPress={handleImageLongPress}
      />

      {allVariations.length > 1 && displayIndex < allVariations.length - 1 && (
        <PreviewImage
          emoji={allVariations[displayIndex + 1]}
          direction="right"
          onClick={() => handleVariationChange(displayIndex + 1)}
        />
      )}

      {allVariations.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
          {allVariations.map((_, index) => (
            <button
              key={index}
              onClick={() => handleVariationChange(index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                index === displayIndex
                  ? "bg-primary w-3"
                  : "bg-primary/30 hover:bg-primary/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  ), [currentEmoji, allVariations, displayIndex]);

  // 缓存变体列表区域
  const variationsSection = useMemo(() => (
    allVariations.length > 1 && (
      <VariationsList
        variations={allVariations}
        currentIndex={displayIndex}
        onVariationSelect={handleVariationChange}
        isLoading={false}
      />
    )
  ), [allVariations, displayIndex]);

  const incompleteView = (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <EmojiContainer emoji={currentEmoji} size="lg" />
          <div className="text-sm text-muted-foreground">
            {currentEmoji.status === 'failed' ? tContainer('failed') : tContainer('processing')}
          </div>

          {showRemixGenerator && (
            <div className="w-full max-w-md">
              <UnifiedGenmojiGenerator
                initialPrompt={currentEmoji.prompt}
                onGenerated={(newEmoji) => {
                  setShowRemixGenerator(false);
                  router.push(`/emoji/${newEmoji.slug}`);
                }}
              />
            </div>
          )}

          {(currentEmoji.status === 'failed' || refreshAttempted) && (
            <div className="w-full max-w-sm space-y-3">
              <Button
                variant="outline"
                className="w-full text-muted-foreground hover:text-foreground py-4"
                onClick={() => setShowRemixGenerator(!showRemixGenerator)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {showRemixGenerator ? t('hideGenerator') : t('reGenmoji')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isIncomplete) {
    return incompleteView;
  }

  return (
    <div className="mx-auto px-4 flex w-full max-w-2xl flex-col items-center">
      {/* <div className="mx-auto flex w-full max-w-xl flex-col items-center"> */}

      {/* 标题区域 */}
      <div className="w-full mb-2">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={handlePromptCopy}
            className="group text-left relative flex-1 min-w-0"
          >
            <h1
              className="text-xl font-medium truncate leading-tight"
              title={currentEmoji.prompt}
            >
              {currentEmoji.prompt}
            </h1>
            {showPromptCopied && (
              <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-xs text-green-500 z-50">
                <CheckIcon className="h-3 w-3" />
                <span>{t('copied')}</span>
              </div>
            )}
          </button>

          <div className="flex items-start gap-1.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "p-1.5 rounded-full transition-colors relative hover:bg-muted/50",
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              )}
            >
              <AnimatePresence mode="wait">
                {showLikeEffect && (
                  <motion.div
                    key="like-effect"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{
                      scale: [1, 1.5, 0.8, 1.2, 1],
                      opacity: [1, 0.8, 1, 0.8, 1],
                      rotate: [0, -15, 15, -10, 0]
                    }}
                    transition={{
                      duration: 0.6,
                      times: [0, 0.2, 0.4, 0.6, 1],
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <HeartIcon className="h-4 w-4" fill="currentColor" />
                  </motion.div>
                )}
                <motion.div
                  key="heart-icon"
                  animate={showLikeEffect ? { scale: [1, 0.8, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <HeartIcon
                    className={cn(
                      "h-4 w-4 transition-all",
                      isLiking && "animate-pulse"
                    )}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {likesCount > 0 && (
                  <motion.span
                    key={`count-${likesCount}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-3 -right-3 text-xs bg-background border rounded-full px-1.5 py-0.5 select-none"
                  >
                    {likesCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 p-1.5 h-auto">
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsShareSheetOpen(true)}>
                  <Share2Icon className="mr-2 h-4 w-4" />
                  {t('share.title')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <CopyIcon className="mr-2 h-4 w-4" />
                  {t('copyLink')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {mainImageSection}
      {variationsSection}

      {/* 信息栏 */}
      <div className="w-full relative mb-2 space-y-2">
        {/* 基本信息行 */}
        <div className="relative">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex items-center justify-center gap-4 min-w-max w-full">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="uppercase whitespace-nowrap">STYLE</span>
                <Link 
                  href={`/styles/${encodeURIComponent(currentEmoji.model)}`}
                  className="text-primary hover:text-primary hover:underline transition-colors"
                >
                  {currentEmoji.model}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="uppercase whitespace-nowrap">MAKER</span>
                <span className="text-foreground">anonymous</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="uppercase whitespace-nowrap">DATE</span>
                <span className="text-foreground whitespace-nowrap">
                  {currentEmoji.created_at 
                    ? (currentEmoji.created_at.includes('T')
                        ? currentEmoji.created_at.split('T')[0]
                        : currentEmoji.created_at.split(' ')[0] || currentEmoji.created_at)
                    : '-'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* 扩展信息行 */}
        {currentEmoji.subject_count && (
          <div className="relative">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex items-center justify-center gap-4 min-w-max w-full">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="uppercase whitespace-nowrap">CATEGORY</span>
                  <Link 
                    href={`/category/${encodeURIComponent(currentEmoji.category || '')}`}
                    className="text-primary capitalize hover:text-primary hover:underline transition-colors"
                  >
                    {currentEmoji.category?.replace(/_/g, ' ')}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="uppercase whitespace-nowrap">COLOR</span>
                  <Link 
                    href={`/color/${encodeURIComponent(currentEmoji.primary_color || '')}`}
                    className="text-primary capitalize hover:text-primary hover:underline transition-colors"
                  >
                    {currentEmoji.primary_color}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="uppercase whitespace-nowrap">QUALITY</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          i < currentEmoji.quality_score!
                            ? "bg-primary"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="uppercase whitespace-nowrap">SUBJECTS</span>
                  <span className="text-foreground">{currentEmoji.subject_count}</span>
                </div>
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        )}

        {/* 关键词标签行 */}
        {(() => {
          try {
            const keywords = currentEmoji.keywords ?
              (typeof currentEmoji.keywords === 'string' ?
                JSON.parse(currentEmoji.keywords) :
                currentEmoji.keywords
              ) : [];

            return keywords.length > 0 && (
              <div className="relative">
                <div className="overflow-x-auto hide-scrollbar">
                  <div className="flex items-center justify-center gap-2 min-w-max w-full">
                    {keywords.map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground whitespace-nowrap"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </div>
            );
          } catch (e) {
            return null;
          }
        })()}
      </div>

      

      {/* 操作按钮区 */}
      <div className="w-full max-w-sm pt-2">
        {/* 条件显示 UnifiedGenmojiGenerator */}
        {showRemixGenerator && (
          <div className="w-full mb-4">
            <UnifiedGenmojiGenerator
              initialPrompt={currentEmoji.prompt}
              onGenerated={(newEmoji) => {
                // 直接跳转到新生成的 emoji 页面
                setShowRemixGenerator(false);
                router.push(`/emoji/${newEmoji.slug}`);
              }}
            />
          </div>
        )}
        
        <div className="space-y-3">
          {/* Remix 按钮单独一行 */}
          <Button
            variant="outline"
            className="w-full text-muted-foreground hover:text-foreground relative py-4 bg-pink-500/5 hover:bg-pink-500/10 dark:bg-pink-500/10 dark:hover:bg-pink-500/20 border-pink-500/20 dark:border-pink-500/30 transition-all duration-200"
            onClick={() => setShowRemixGenerator(!showRemixGenerator)}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {showRemixGenerator ? t('hideGenerator') : t('reGenmoji')}
          </Button>

          {/* Share / Copy / Download 主 CTA */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              className="w-full py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 relative"
              onClick={handleShare}
              disabled={isSharing}
            >
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-300",
                  showShared ? "opacity-100" : "opacity-0"
                )}
              >
                <CheckIcon className="h-4 w-4" />
                <span className="ml-2 text-sm font-medium">{t('share.shared')}</span>
              </div>
              <div
                className={cn(
                  "flex items-center transition-opacity duration-300",
                  isSharing || showShared ? "opacity-0" : "opacity-100"
                )}
              >
                <Share2Icon className="mr-2 h-3.5 w-3.5" />
                {t('share.send')}
              </div>
              {isSharing && !showShared && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full text-muted-foreground hover:text-foreground py-4 bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border-blue-500/20 dark:border-blue-500/30 transition-all duration-200 relative"
              onClick={handleCopyImage}
              disabled={isCopyingImage || showImageCopied}
            >
              {/* 复制成功状态 */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-300",
                showImageCopied ? "bg-green-500/20 opacity-100" : "opacity-0"
              )}>
                <CheckIcon className="h-4 w-4 text-green-600" />
                <span className="ml-2 text-sm text-green-600 font-medium">{t('copied')}</span>
              </div>
              
              {/* 复制中状态 */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-300",
                isCopyingImage ? "bg-blue-500/20 opacity-100" : "opacity-0"
              )}>
                <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm font-medium">{t('copying')}</span>
              </div>
              
              {/* 默认状态 */}
              <div className={cn(
                "flex items-center transition-opacity duration-300",
                (isCopyingImage || showImageCopied) ? "opacity-0" : "opacity-100"
              )}>
                <CopyIcon className="mr-2 h-3.5 w-3.5" />
                {t('copyImage')}
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full text-muted-foreground hover:text-foreground py-4 bg-violet-500/5 hover:bg-violet-500/10 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 border-violet-500/20 dark:border-violet-500/30 transition-all duration-200"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <div className="flex items-center">
                  <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('downloading')}
                </div>
              ) : (
                <div className="flex items-center">
                  <DownloadIcon className="mr-2 h-3.5 w-3.5" />
                  {t('download')}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Usage Information Section */}
      <div className={cn(
        "w-full max-w-sm mt-4  rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/10 border border-blue-500/10 dark:border-blue-500/20 backdrop-blur-sm transition-all duration-200",
        isUsageExpanded ? "px-5 py-4" : "px-4 py-2.5"
      )}>
        <button 
          onClick={() => setIsUsageExpanded(!isUsageExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center">
            <Share2Icon className={cn("mr-2 text-blue-500 transition-all", 
              isUsageExpanded ? "w-4 h-4" : "w-3.5 h-3.5")} />
            <h3 className={cn("font-medium text-foreground transition-all", 
              isUsageExpanded ? "text-lg" : "text-base")}>{t('usage.title')}</h3>
          </div>
          {isUsageExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {isUsageExpanded && (
          <div className="mt-3 pt-3 border-t border-blue-500/10 dark:border-blue-500/20">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t('usage.description', { prompt: currentEmoji.prompt })}
            </p>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <p className="text-xs font-medium text-foreground/90">{t('usage.license')}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* </div> */}

      {isShareSheetOpen && (
        <ShareSheet emoji={currentEmoji} open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen} />
      )}
    </div>
  );
}
