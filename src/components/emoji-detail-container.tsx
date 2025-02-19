"use client";

import { Emoji } from "@/types/emoji";
import EmojiContainer from "@/components/emoji-container";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { performAction, toggleLike } from "@/lib/api";
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

interface EmojiDetailContainerProps {
  emoji: Emoji;
}

export function EmojiDetailContainer({ emoji }: EmojiDetailContainerProps) {
  const t = useTranslations('emoji.detail');
  const locale = useLocale();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(emoji.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showPromptCopied, setShowPromptCopied] = useState(false);
  const [showImageCopied, setShowImageCopied] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showLikeEffect, setShowLikeEffect] = useState(false);
  const likeTimeoutRef = useRef<NodeJS.Timeout>();
  const initialLikeState = useRef(false);

  // 记录浏览行为
  useEffect(() => {
    const referrer = document.referrer;
    performAction(emoji.slug, locale, 'view', {
      referrer,
    }).catch(error => {
      console.error('Failed to record view:', error);
    });
  }, [emoji.slug, locale]);

  // 检查用户是否已经点赞过
  useEffect(() => {
    const likedEmojis = JSON.parse(localStorage.getItem('likedEmojis') || '[]');
    const hasLiked = likedEmojis.includes(emoji.slug);
    setIsLiked(hasLiked);
    initialLikeState.current = hasLiked;
    
    // 清理函数
    return () => {
      if (likeTimeoutRef.current) {
        clearTimeout(likeTimeoutRef.current);
      }
    };
  }, [emoji.slug]);

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
      performAction(emoji.slug, locale, 'copy').catch(error => {
        console.error('Failed to record copy action:', error);
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // 复制提示词
  const handlePromptCopy = async () => {
    try {
      await navigator.clipboard.writeText(emoji.prompt);
      setShowPromptCopied(true);
      setTimeout(() => setShowPromptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  // 复制图片到剪贴板
  const handleCopyImage = async () => {
    try {
      const response = await fetch(emoji.image_url);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setShowImageCopied(true);
      setTimeout(() => setShowImageCopied(false), 2000);

      // 异步提交行为数据
      performAction(emoji.slug, locale, 'copy', { type: 'image' }).catch(error => {
        console.error('Failed to record image copy action:', error);
      });
    } catch (err) {
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
      const response = await fetch(emoji.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${emoji.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 异步提交行为数据
      performAction(emoji.slug, locale, 'download').catch(error => {
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
    const text = encodeURIComponent(`Check out this emoji: ${emoji.prompt}`);
    const title = encodeURIComponent(emoji.prompt);
    const image = encodeURIComponent(emoji.image_url);

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
      const response = await fetch(emoji.image_url);
      const blob = await response.blob();

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${emoji.slug}.png`;
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
          title: emoji.prompt,
          text: t('sharing.defaultText', { prompt: emoji.prompt }),
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
    if (liked && !likedEmojis.includes(emoji.slug)) {
      likedEmojis.push(emoji.slug);
    } else if (!liked) {
      const index = likedEmojis.indexOf(emoji.slug);
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
      const response = await toggleLike(emoji.slug, locale);
      
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

  return (
    <div className="container mx-auto px-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">

        {/* 标题区域 */}
        <div className="w-full mb-6">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={handlePromptCopy}
              className="group text-left relative flex-1 min-w-0"
            >
              <h1
                className="text-xl font-medium truncate leading-tight"
                title={emoji.prompt}
              >
                {emoji.prompt}
              </h1>
              {showPromptCopied && (
                <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-xs text-green-500">
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
                  <DropdownMenuItem onClick={handleCopy}>
                    <CopyIcon className="mr-2 h-4 w-4" />
                    {t('copyLink')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    {t('download')}
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
                  <DropdownMenuItem onClick={handleWeChatShare}>
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    {t('share.wechat')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* 图片展示区 */}
        <div className="relative w-full aspect-square mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-muted/5 to-muted/10 backdrop-blur-sm"
          >
            <EmojiContainer emoji={emoji} size="xl" />
          </motion.div>
        </div>
        {/* 信息栏 - MODEL/DIMENSIONS/DATE */}
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <span className="uppercase">CATEGORY</span>
            <span className="text-foreground">Emoji</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="uppercase">MAKER</span>
            <span className="text-foreground">anonymous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="uppercase">DATE</span>
            <span className="text-foreground">
              {emoji.created_at ? new Date(emoji.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>

        {/* 操作按钮区 */}
        <div className="w-full max-w-sm">
          <div className="grid grid-cols-2 gap-3">
            <UnifiedGenmojiGenerator
              trigger={
                <Button
                  variant="outline"
                  className="w-full text-muted-foreground hover:text-foreground relative py-4 bg-pink-500/5 hover:bg-pink-500/10 dark:bg-pink-500/10 dark:hover:bg-pink-500/20 border-pink-500/20 dark:border-pink-500/30 transition-all duration-200"
                >
                  <ImageIcon className="mr-2 h-3.5 w-3.5" />
                  {t('reGenmoji')}
                </Button>
              }
              initialPrompt={emoji.prompt}
            />

            <Button
              variant="outline"
              className="w-full text-muted-foreground hover:text-foreground py-4 bg-violet-500/5 hover:bg-violet-500/10 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 border-violet-500/20 dark:border-violet-500/30 transition-all duration-200"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-3.5 w-3.5" />
              {t('share.title')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 