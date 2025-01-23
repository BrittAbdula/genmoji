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
  TwitterIcon,
  LinkedinIcon
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
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
  const [showCopied, setShowCopied] = useState(false);
  const [showPromptCopied, setShowPromptCopied] = useState(false);

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

  // 构建社交媒体分享链接
  const getSocialShareUrl = (platform: 'twitter' | 'linkedin') => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Check out this emoji: ${emoji.prompt}`);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      default:
        return '';
    }
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
                <span>Copied!</span>
              </div>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full transition-colors ${
              isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <HeartIcon className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
          </motion.button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <CopyIcon className="mr-2 h-4 w-4" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('twitter'), '_blank')}>
                <TwitterIcon className="mr-2 h-4 w-4" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(getSocialShareUrl('linkedin'), '_blank')}>
                <LinkedinIcon className="mr-2 h-4 w-4" />
                Share on LinkedIn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => window.open(emoji.image_url, '_blank')}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download
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