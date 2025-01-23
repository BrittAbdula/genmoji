'use client';

import { Emoji } from "@/types/emoji";
import { Button } from "./ui/button";
import { 
  DownloadIcon, 
  ShareIcon, 
  MoreHorizontalIcon,
  HeartIcon,
  CheckIcon,
  CopyIcon
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { constructShareUrl } from "@/lib/utils";

interface EmojiDetailProps {
  emoji: Emoji;
}

export function EmojiDetail({ emoji }: EmojiDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showPromptCopied, setShowPromptCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emoji.image_url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePromptCopy = async () => {
    try {
      await navigator.clipboard.writeText(emoji.prompt);
      setShowPromptCopied(true);
      setTimeout(() => setShowPromptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // 原生分享
        await navigator.share({
          title: emoji.prompt,
          text: siteConfig.sharing.defaultText,
          url: window.location.href
        });
      } else {
        // 打开分享菜单
        const shareUrl = constructShareUrl('twitter', {
          url: window.location.href,
          title: emoji.prompt,
          description: siteConfig.sharing.defaultText,
        });
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Emoji Info */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePromptCopy}
          className="group flex-1 text-left relative"
        >
          <h1 className="text-2xl font-bold truncate" title={emoji.prompt}>
            {emoji.prompt}
          </h1>
          <div className={cn(
            "absolute bottom-full left-0 mb-1",
            "flex items-center gap-1 text-xs",
            "transition-opacity duration-200",
            showPromptCopied ? "text-green-500 opacity-100" : "opacity-0"
          )}>
            <CheckIcon className="h-3 w-3" />
            <span>Copied!</span>
          </div>
        </button>

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
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                Share
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => window.open('/report', '_blank')}>
                Report
              </DropdownMenuItem> */}
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