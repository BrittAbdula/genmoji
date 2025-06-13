"use client";

import { Emoji } from "@/types/emoji";
import EmojiContainer from "@/components/emoji-container";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { performAction, toggleLike, getEmojisByBaseSlug } from "@/lib/api";
import { Button } from "./ui/button";
import {
  DownloadIcon,
  Share2,
  MoreHorizontalIcon,
  HeartIcon,
  CheckIcon,
  CopyIcon,
  LinkedinIcon,
  X,
  ImageIcon,
  FacebookIcon,
  MessageCircleIcon,
  SendIcon,
  InstagramIcon,
  Share2Icon,
  QrCodeIcon,
  UploadIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useState, useEffect, useRef, memo, useMemo, forwardRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';
import { UnifiedGenmojiGenerator } from './unified-genmoji-generator';
import { TimeAgo } from './time-ago';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

interface EmojiDetailContainerProps {
  emoji: Emoji;
}

// 主图片展示组件
const MainImage = memo(({
  emoji,
  onSwipe,
  className
}: {
  emoji: Emoji;
  onSwipe: (direction: 'left' | 'right') => void;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-muted/5 to-muted/10 backdrop-blur-sm", className)}
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
          <Image
            src={emoji.image_url}
            alt={`prompt: ${emoji.prompt}`}
            width={512}
            height={512}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
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
        <Image
          src={emoji.image_url}
          alt={`${direction} variation`}
          width={128}
          height={128}
          className="w-full h-full object-contain"
        />
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
        "relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden",
        isSelected ? "bg-muted/30 ring-2 ring-primary/30" : "hover:bg-muted/10"
      )}
    >
      <Image
        src={variation.image_url}
        alt={variation.prompt}
        width={96}
        height={96}
        className="w-full h-full object-contain p-2"
        loading="lazy"
        draggable={false}
      />
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
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center">
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

  // 获取变体 - 只在初始化时调用一次
  const fetchVariations = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const newEmojis = await getEmojisByBaseSlug(initialEmoji.slug, locale, LIMIT, 0);

      // 确保当前emoji在列表中，并找到它的位置
      const currentEmojiIndex = newEmojis.findIndex(e => e.slug === initialEmoji.slug);
      if (currentEmojiIndex === -1) {
        // 如果当前emoji不在返回列表中，将其添加到开头
        setAllVariations([initialEmoji, ...newEmojis]);
        setDisplayIndex(0);
      } else {
        setAllVariations(newEmojis);
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

  // 检查点赞状态
  const checkLikeStatus = (slug: string) => {
    const likedEmojis = JSON.parse(localStorage.getItem('likedEmojis') || '[]');
    const hasLiked = likedEmojis.includes(slug);
    setIsLiked(hasLiked);
    initialLikeState.current = hasLiked;
  };

  // 检查用户是否已经点赞过
  useEffect(() => {
    checkLikeStatus(initialEmoji.slug);
    return () => {
      if (likeTimeoutRef.current) {
        clearTimeout(likeTimeoutRef.current);
      }
    };
  }, [initialEmoji.slug]);

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
      performAction(initialEmoji.slug, locale, 'copy').catch(error => {
        console.error('Failed to record copy action:', error);
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // 复制提示词
  const handlePromptCopy = async () => {
    try {
      await navigator.clipboard.writeText(initialEmoji.prompt);
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
      const response = await fetch(initialEmoji.image_url);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setIsCopyingImage(false);
      setShowImageCopied(true);
      setTimeout(() => setShowImageCopied(false), 2000);

      // 异步提交行为数据
      performAction(initialEmoji.slug, locale, 'copy', { type: 'image' }).catch(error => {
        console.error('Failed to record image copy action:', error);
      });
    } catch (err) {
      setIsCopyingImage(false);
      // 提示用户长按保存
      alert(t('alert.longPressToSave'));
    }
  };

  // 处理下载
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // 先执行下载操作
      const response = await fetch(initialEmoji.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${initialEmoji.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 异步提交行为数据
      performAction(initialEmoji.slug, locale, 'download').catch(error => {
        console.error('Failed to record download action:', error);
      });
    } catch (error) {
      console.error('Failed to download emoji:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // 构建社交媒体分享链接
  const getSocialShareUrl = (platform: 'twitter' | 'linkedin' | 'facebook' | 'pinterest' | 'telegram' | 'whatsapp' | 'wechat' | 'imgur') => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Check out this emoji: ${initialEmoji.prompt}`);
    const title = encodeURIComponent(initialEmoji.prompt);
    const image = encodeURIComponent(initialEmoji.image_url);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'pinterest':
        return `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${text}`;
      case 'telegram':
        return `https://t.me/share/url?url=${url}&text=${text}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${text}%20${url}`;
      case 'wechat':
        return `weixin://dl/posts/${url}`;
      case 'imgur':
        return `https://imgur.com/upload?url=${image}`;
      default:
        return '';
    }
  };

  // 处理分享到 Instagram
  const handleInstagramShare = async () => {
    try {
      const response = await fetch(initialEmoji.image_url);
      const blob = await response.blob();

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${initialEmoji.slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert(t('alert.instagramShare'));
    } catch (err) {
      console.error('Failed to prepare Instagram share:', err);
    }
  };

  // 处理分享到微信
  const handleWeChatShare = () => {
    alert(t('alert.wechatShare'));
  };

  // 处理分享
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: initialEmoji.prompt,
          text: t('sharing.defaultText', { prompt: initialEmoji.prompt }),
          url: getShareUrl()
        });
      } else {
        window.open(getSocialShareUrl('twitter'), '_blank');
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  // 更新本地存储的点赞状态
  const updateLocalLikeStatus = (liked: boolean) => {
    const likedEmojis = JSON.parse(localStorage.getItem('likedEmojis') || '[]');
    if (liked && !likedEmojis.includes(initialEmoji.slug)) {
      likedEmojis.push(initialEmoji.slug);
    } else if (!liked) {
      const index = likedEmojis.indexOf(initialEmoji.slug);
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
      const response = await toggleLike(initialEmoji.slug, locale);

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

  return (
    <div className="container mx-auto px-2 flex w-full max-w-xl flex-col items-center">
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
              title={initialEmoji.prompt}
            >
              {initialEmoji.prompt}
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
                <DropdownMenuItem onClick={handleShare}>
                  <Share2Icon className="mr-2 h-4 w-4" />
                  {t('share.title')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <CopyIcon className="mr-2 h-4 w-4" />
                  {t('copyLink')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('twitter'), '_blank')}>
                  <X className="mr-2 h-4 w-4" />
                  {t('share.twitter')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('facebook'), '_blank')}>
                  <FacebookIcon className="mr-2 h-4 w-4" />
                  {t('share.facebook')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('linkedin'), '_blank')}>
                  <LinkedinIcon className="mr-2 h-4 w-4" />
                  {t('share.linkedin')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('pinterest'), '_blank')}>
                  <Share2Icon className="mr-2 h-4 w-4" />
                  {t('share.pinterest')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleInstagramShare}>
                  <InstagramIcon className="mr-2 h-4 w-4" />
                  {t('share.instagram')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('imgur'), '_blank')}>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {t('share.imgur')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('telegram'), '_blank')}>
                  <SendIcon className="mr-2 h-4 w-4" />
                  {t('share.telegram')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('whatsapp'), '_blank')}>
                  <MessageCircleIcon className="mr-2 h-4 w-4" />
                  {t('share.whatsapp')}
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={handleWeChatShare}>
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    {t('share.wechat')}
                  </DropdownMenuItem> */}
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
                  href={`/model/${encodeURIComponent(currentEmoji.model)}`}
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
                  {currentEmoji.created_at ? new Date(currentEmoji.created_at).toLocaleDateString() : '-'}
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
              initialPrompt={initialEmoji.prompt}
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

          {/* Copy 和 Download 按钮一行 */}
          <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
} 