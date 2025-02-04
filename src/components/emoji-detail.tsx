'use client';

import { Emoji } from "@/types/emoji";
import { Button } from "./ui/button";
import { 
  DownloadIcon, 
  ShareIcon, 
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

interface EmojiDetailProps {
  emoji: Emoji;
}

export function EmojiDetail({ emoji }: EmojiDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(emoji.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showPromptCopied, setShowPromptCopied] = useState(false);
  const [showImageCopied, setShowImageCopied] = useState(false);

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
      console.error('Failed to copy image:', err);
    }
  };

  // 构建社交媒体分享链接
  const getSocialShareUrl = (platform: 'twitter' | 'linkedin' | 'facebook' | 'pinterest' | 'telegram' | 'whatsapp' | 'wechat') => {
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
        // 微信需要特殊处理，通常是显示二维码
        return `weixin://dl/posts/${url}`;
      default:
        return '';
    }
  };

  // 处理分享到 Instagram
  const handleInstagramShare = async () => {
    try {
      // Instagram 分享需要先下载图片
      const response = await fetch(emoji.image_url);
      const blob = await response.blob();
      
      // 创建一个临时的 a 标签来触发下载
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${emoji.slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 提示用户如何在 Instagram 上分享
      alert('Image downloaded! You can now share it on Instagram:\n1. Open Instagram\n2. Create a new post\n3. Select the downloaded image\n4. Add the prompt as caption');
    } catch (err) {
      console.error('Failed to prepare Instagram share:', err);
    }
  };

  // 处理分享到微信
  const handleWeChatShare = () => {
    // 这里可以集成二维码生成库，显示分享链接的二维码
    alert('Open WeChat and scan the QR code to share');
    // TODO: 显示二维码弹窗
  };

  // 处理分享
  const handleShare = async () => {
    try {
      if (navigator.share) {
        // 原生分享API
        await navigator.share({
          title: emoji.prompt,
          text: `Check out this emoji: ${emoji.prompt}`,
          url: getShareUrl()
        });
      } else {
        // 如果不支持原生分享，打开Twitter分享
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
      
      const response = await fetch(`https://gen.genmojionline.com/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: emoji.slug }),
      });

      const data = await response.json() as { success: boolean, likes_count: number };

      if (data.success) {
        // 更新本地存储
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
                <span>Gemoji Prompt Copied!</span>
              </div>
            )}
          </button>
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
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(emoji.image_url, '_blank')}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('twitter'), '_blank')}>
                <X className="mr-2 h-4 w-4" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('facebook'), '_blank')}>
                <FacebookIcon className="mr-2 h-4 w-4" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('linkedin'), '_blank')}>
                <LinkedinIcon className="mr-2 h-4 w-4" />
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('pinterest'), '_blank')}>
                <Share2Icon className="mr-2 h-4 w-4" />
                Share on Pinterest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleInstagramShare}>
                <InstagramIcon className="mr-2 h-4 w-4" />
                Share on Instagram
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('telegram'), '_blank')}>
                <SendIcon className="mr-2 h-4 w-4" />
                Share on Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('whatsapp'), '_blank')}>
                <MessageCircleIcon className="mr-2 h-4 w-4" />
                Share on WhatsApp
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
          onClick={handleCopyImage}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Copy Genmoji
          {showImageCopied && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-green-500">
              <CheckIcon className="h-3 w-3" />
              <span>Genmoji Copied!</span>
            </div>
          )}
        </Button>

        <Button 
          variant="outline"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={handleShare}
        >
          <ShareIcon className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
} 