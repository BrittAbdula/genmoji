"use client";

import { Emoji } from "@/types/emoji";
import EmojiContainer from "@/components/emoji-container";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { likeEmoji } from "@/lib/api";
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
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';
import { GenmojiGeneratorDialog } from "./genmoji-generator-dialog";
import { TimeAgo } from './time-ago';

interface EmojiDetailContainerProps {
  emoji: Emoji;
}

export function EmojiDetailContainer({ emoji }: EmojiDetailContainerProps) {
  const t = useTranslations('emoji.detail');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(emoji.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showPromptCopied, setShowPromptCopied] = useState(false);
  const [showImageCopied, setShowImageCopied] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  // 检查用户是否已经点赞过
  useEffect(() => {
    const checkLikeStatus = () => {
      const likedEmojis = JSON.parse(localStorage.getItem('likedEmojis') || '[]');
      setIsLiked(likedEmojis.includes(emoji.slug));
    };

    checkLikeStatus();
  }, [emoji.slug]);

  // 获取当前URL
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };

  // 复制链接
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
    } catch (err) {
      // 提示用户长按保存
      alert(t('alert.longPressToSave'));
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

  // 处理点赞
  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const data = await likeEmoji(emoji.slug);

      if (data.success) {
        const likedEmojis = JSON.parse(localStorage.getItem('likedEmojis') || '[]');
        if (!likedEmojis.includes(emoji.slug)) {
          likedEmojis.push(emoji.slug);
          localStorage.setItem('likedEmojis', JSON.stringify(likedEmojis));
        }

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      >
        {/* 左侧：大图展示区 */}
        <EmojiContainer emoji={emoji} size="xl" />

        {/* 右侧：详情区 */}
        <div className="flex flex-col space-y-6">
            <div className="space-y-6 w-full max-w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <button
                    onClick={handlePromptCopy}
                    className="group text-left w-full relative"
                  >
                    <h1 
                      className="text-2xl font-bold truncate" 
                      title={emoji.prompt}
                    >
                      {emoji.prompt}
                    </h1>
                    {showPromptCopied && (
                      <div className="absolute -top-6 left-0 flex items-center gap-1 text-xs text-green-500">
                        <CheckIcon className="h-3 w-3" />
                        <span>{t('copied')}</span>
                      </div>
                    )}
                  </button>
                  {emoji.created_at && (
                    <TimeAgo 
                      date={emoji.created_at} 
                      className="text-sm text-muted-foreground"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    disabled={isLiking}
                    className={cn(
                      "p-2 rounded-full transition-colors relative",
                      isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                    )}
                  >
                    <HeartIcon 
                      className={cn(
                        "h-5 w-5 transition-all",
                        isLiking && "animate-pulse"
                      )} 
                      fill={isLiked ? "currentColor" : "none"} 
                    />
                    <AnimatePresence>
                      {likesCount > 0 && (
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium"
                        >
                          {likesCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleCopy}>
                        <CopyIcon className="mr-2 h-4 w-4" />
                        {t('copyLink')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(emoji.image_url, '_blank')}>
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

              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  className="w-full text-muted-foreground hover:text-foreground relative"
                  onClick={() => setIsGeneratorOpen(true)}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {t('reGenmoji')}
                </Button>

                <Button 
                  variant="outline"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('share.title')}
                </Button>
              </div>

              <GenmojiGeneratorDialog
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                initialPrompt={emoji.prompt}
              />
            </div>
          </div>
      </motion.div>
    </div>
  );
} 